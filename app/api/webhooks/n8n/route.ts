import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { WebhookPayload, WebhookResponse, LeadSource, LeadStatus } from '@/lib/integrations.types';

// Supabase client con service role para operaciones del servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Token secreto para validar webhooks (configurar en n8n y en .env)
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/n8n
 *
 * Endpoint para recibir webhooks desde n8n.
 * Soporta varios eventos:
 * - lead.create: Crear un nuevo lead
 * - lead.update: Actualizar un lead existente
 * - message.received: Registrar mensaje recibido
 * - activity.log: Registrar actividad generica
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validar token de autorizacion
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (WEBHOOK_SECRET && token !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as WebhookResponse,
        { status: 401 }
      );
    }

    // Parsear payload
    const payload: WebhookPayload = await request.json();
    const { event, source, data, metadata } = payload;

    // Obtener sitio_id (por ahora usamos el primero, ajustar segun necesidad)
    // En produccion, el sitio_id vendria en el payload o se mapea por integracion
    const { data: sitios } = await supabase
      .from('sitios')
      .select('id')
      .limit(1)
      .single();

    const sitioId = metadata?.sitio_id as string || sitios?.id;

    if (!sitioId) {
      return NextResponse.json(
        { success: false, error: 'No sitio found' } as WebhookResponse,
        { status: 400 }
      );
    }

    let result: WebhookResponse;

    // Procesar segun tipo de evento
    switch (event) {
      case 'lead.create':
        result = await handleLeadCreate(sitioId, source, data);
        break;

      case 'lead.update':
        result = await handleLeadUpdate(data);
        break;

      case 'message.received':
        result = await handleMessageReceived(sitioId, source, data);
        break;

      case 'activity.log':
        result = await handleActivityLog(sitioId, data);
        break;

      default:
        result = {
          success: false,
          message: `Unknown event type: ${event}`,
          error: `Unknown event type: ${event}`
        };
    }

    // Loggear webhook
    await logWebhook(sitioId, source, event, payload, result, Date.now() - startTime, request);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    });

  } catch (error) {
    console.error('Webhook error:', error);

    const errorResult: WebhookResponse = {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Internal server error'
    };

    // Intentar loggear el error
    try {
      const payload = await request.clone().json().catch(() => ({}));
      await logWebhook(null, 'unknown', 'error', payload, errorResult, Date.now() - startTime, request);
    } catch {}

    return NextResponse.json(errorResult, { status: 500 });
  }
}

/**
 * Crear un nuevo lead
 */
async function handleLeadCreate(
  sitioId: string,
  source: LeadSource,
  data: WebhookPayload['data']
): Promise<WebhookResponse> {
  const { name, email, phone, message, source_id, source_url, platform_data } = data;

  if (!name) {
    return { success: false, message: 'Validation error', error: 'Name is required' };
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      sitio_id: sitioId,
      name,
      email,
      phone,
      source,
      source_id,
      source_url,
      message,
      status: 'new' as LeadStatus,
      priority: 'medium',
      metadata: platform_data || {}
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Database error', error: error.message };
  }

  return {
    success: true,
    message: 'Lead created successfully',
    lead_id: lead.id
  };
}

/**
 * Actualizar un lead existente
 */
async function handleLeadUpdate(
  data: WebhookPayload['data'] & { lead_id?: string; status?: LeadStatus }
): Promise<WebhookResponse> {
  const { lead_id, ...rest } = data;
  const updateData: Partial<WebhookPayload['data']> & { status?: LeadStatus } = rest;

  if (!lead_id) {
    return { success: false, message: 'Validation error', error: 'lead_id is required' };
  }

  const { error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', lead_id);

  if (error) {
    return { success: false, message: 'Database error', error: error.message };
  }

  return {
    success: true,
    message: 'Lead updated successfully',
    lead_id
  };
}

/**
 * Registrar mensaje recibido (y crear lead si no existe)
 */
async function handleMessageReceived(
  sitioId: string,
  source: LeadSource,
  data: WebhookPayload['data']
): Promise<WebhookResponse> {
  const { email, phone, message, source_id, name } = data;

  // Buscar lead existente por email o telefono
  let leadId: string | undefined;

  if (email || phone) {
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('sitio_id', sitioId)
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(1)
      .single();

    leadId = existingLead?.id;
  }

  // Si no existe, crear nuevo lead
  if (!leadId && name) {
    const createResult = await handleLeadCreate(sitioId, source, data);
    if (createResult.success) {
      leadId = createResult.lead_id;
    }
  }

  // Crear actividad de mensaje recibido
  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      sitio_id: sitioId,
      type: 'message_received',
      title: `Mensaje de ${source}`,
      description: message?.substring(0, 200),
      lead_id: leadId,
      metadata: { source, source_id }
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Database error', error: error.message };
  }

  return {
    success: true,
    message: 'Message logged successfully',
    lead_id: leadId,
    activity_id: activity.id
  };
}

/**
 * Registrar actividad generica
 */
async function handleActivityLog(
  sitioId: string,
  data: WebhookPayload['data'] & {
    type?: string;
    title?: string;
    lead_id?: string;
  }
): Promise<WebhookResponse> {
  const { type = 'system', title = 'Actividad', message: description, lead_id } = data;

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      sitio_id: sitioId,
      type,
      title,
      description,
      lead_id,
      metadata: data
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Database error', error: error.message };
  }

  return {
    success: true,
    message: 'Activity logged successfully',
    activity_id: activity.id
  };
}

/**
 * Loggear webhook para debugging
 */
async function logWebhook(
  sitioId: string | null,
  source: string,
  event: string | undefined,
  payload: unknown,
  response: WebhookResponse,
  processingTime: number,
  request: NextRequest
) {
  try {
    await supabase.from('webhook_logs').insert({
      sitio_id: sitioId,
      source,
      event,
      payload,
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'content-type': request.headers.get('content-type')
      },
      success: response.success,
      response,
      error: response.error,
      processing_time_ms: processingTime,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    });
  } catch (error) {
    console.error('Error logging webhook:', error);
  }
}

/**
 * GET /api/webhooks/n8n
 *
 * Endpoint de salud para verificar que el webhook esta activo
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'NeumorStudio n8n Webhook',
    timestamp: new Date().toISOString(),
    events: ['lead.create', 'lead.update', 'message.received', 'activity.log']
  });
}
