import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { DashboardStats, LeadSource } from '@/lib/integrations.types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/dashboard/stats
 *
 * Obtener estadisticas del dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sitioId = searchParams.get('sitio_id');
    const period = searchParams.get('period') || '30'; // dias

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo);

    // Query base
    let leadsQuery = supabase.from('leads').select('*');
    let activitiesQuery = supabase.from('activities').select('*');

    if (sitioId) {
      leadsQuery = leadsQuery.eq('sitio_id', sitioId);
      activitiesQuery = activitiesQuery.eq('sitio_id', sitioId);
    }

    // Obtener leads del periodo actual
    const { data: currentLeads } = await leadsQuery
      .gte('created_at', startDate.toISOString());

    // Obtener leads del periodo anterior (para comparacion)
    let previousLeadsQuery = supabase.from('leads').select('*');
    if (sitioId) previousLeadsQuery = previousLeadsQuery.eq('sitio_id', sitioId);

    const { data: previousLeads } = await previousLeadsQuery
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Obtener actividades del periodo actual
    const { data: activities } = await activitiesQuery
      .gte('created_at', startDate.toISOString());

    // Obtener todos los leads para totales
    let allLeadsQuery = supabase.from('leads').select('*');
    if (sitioId) allLeadsQuery = allLeadsQuery.eq('sitio_id', sitioId);
    const { data: allLeads } = await allLeadsQuery;

    // Calcular estadisticas de leads
    const leadsBySource: Record<LeadSource, number> = {
      web_form: 0,
      instagram: 0,
      facebook: 0,
      whatsapp: 0,
      google: 0,
      tripadvisor: 0,
      email: 0,
      phone: 0,
      referral: 0,
      n8n: 0,
      manual: 0,
      other: 0
    };

    (allLeads || []).forEach(lead => {
      const source: LeadSource = (lead.source as LeadSource) || 'other';
      const validSource = leadsBySource[source] !== undefined ? source : 'other';
      leadsBySource[validSource] = (leadsBySource[validSource] || 0) + 1;
    });

    const totalLeads = allLeads?.length || 0;
    const newLeads = allLeads?.filter(l => l.status === 'new').length || 0;
    const contactedLeads = allLeads?.filter(l => l.status === 'contacted').length || 0;
    const convertedLeads = allLeads?.filter(l => l.status === 'converted').length || 0;

    // Calcular cambios porcentuales
    const currentCount = currentLeads?.length || 0;
    const previousCount = previousLeads?.length || 0;
    const leadsChange = previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0 ? 100 : 0;

    // Estadisticas de mensajes (basado en actividades)
    const messagesReceived = activities?.filter(a => a.type === 'message_received').length || 0;
    const messagesSent = activities?.filter(a => a.type === 'message_sent' || a.type === 'email_sent').length || 0;

    // Estadisticas de resenas
    const reviewsReceived = activities?.filter(a => a.type === 'review_received').length || 0;
    const reviewsResponded = activities?.filter(a => a.type === 'review_responded').length || 0;

    // Estadisticas de pedidos
    const pedidotionsCreated = activities?.filter(a => a.type === 'pedidotion_created').length || 0;
    const pedidotionsConfirmed = activities?.filter(a => a.type === 'pedidotion_confirmed').length || 0;
    const pedidotionsCancelled = activities?.filter(a => a.type === 'pedidotion_cancelled').length || 0;

    const stats: DashboardStats = {
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        converted: convertedLeads,
        conversion_rate: totalLeads > 0
          ? Math.round((convertedLeads / totalLeads) * 100)
          : 0,
        by_source: leadsBySource
      },
      messages: {
        received: messagesReceived,
        sent: messagesSent,
        pending_reply: 0 // TODO: calcular basado en logica de negocio
      },
      reviews: {
        total: reviewsReceived,
        average_rating: 0, // TODO: obtener de metadata
        responded: reviewsResponded,
        pending: reviewsReceived - reviewsResponded
      },
      pedidotions: {
        total: pedidotionsCreated,
        confirmed: pedidotionsConfirmed,
        pending: pedidotionsCreated - pedidotionsConfirmed - pedidotionsCancelled,
        cancelled: pedidotionsCancelled
      },
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        comparison_percent: {
          leads: leadsChange,
          messages: 0, // TODO: calcular
          reviews: 0,
          pedidotions: 0
        }
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
