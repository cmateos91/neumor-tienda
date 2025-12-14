import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { MessageTrigger } from '@/lib/integrations.types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Variables por defecto si la tabla no existe o esta vacia
const DEFAULT_VARIABLES: Record<MessageTrigger, Array<{
  variable_name: string;
  variable_key: string;
  description: string;
  example_value: string;
}>> = {
  lead_created: [
    { variable_name: 'name', variable_key: '{{name}}', description: 'Nombre del cliente', example_value: 'Juan Garcia' },
    { variable_name: 'email', variable_key: '{{email}}', description: 'Email del cliente', example_value: 'juan@email.com' },
    { variable_name: 'phone', variable_key: '{{phone}}', description: 'Telefono del cliente', example_value: '+34612345678' },
    { variable_name: 'source', variable_key: '{{source}}', description: 'Origen del lead', example_value: 'Instagram' },
    { variable_name: 'message', variable_key: '{{message}}', description: 'Mensaje original del cliente', example_value: 'Hola, quiero pedidor' },
    { variable_name: 'restaurant_name', variable_key: '{{restaurant_name}}', description: 'Nombre del tienda', example_value: 'Mi Tienda' }
  ],
  message_received: [
    { variable_name: 'name', variable_key: '{{name}}', description: 'Nombre del cliente', example_value: 'Juan Garcia' },
    { variable_name: 'email', variable_key: '{{email}}', description: 'Email del cliente', example_value: 'juan@email.com' },
    { variable_name: 'phone', variable_key: '{{phone}}', description: 'Telefono del cliente', example_value: '+34612345678' },
    { variable_name: 'message', variable_key: '{{message}}', description: 'Mensaje recibido', example_value: 'Tienen mesa para 4?' },
    { variable_name: 'restaurant_name', variable_key: '{{restaurant_name}}', description: 'Nombre del tienda', example_value: 'Mi Tienda' }
  ],
  pedidotion_created: [
    { variable_name: 'name', variable_key: '{{name}}', description: 'Nombre del cliente', example_value: 'Juan Garcia' },
    { variable_name: 'date', variable_key: '{{date}}', description: 'Fecha de la pedido', example_value: '25 de Diciembre' },
    { variable_name: 'time', variable_key: '{{time}}', description: 'Hora de la pedido', example_value: '21:00' },
    { variable_name: 'guests', variable_key: '{{guests}}', description: 'Numero de personas', example_value: '4' },
    { variable_name: 'restaurant_name', variable_key: '{{restaurant_name}}', description: 'Nombre del tienda', example_value: 'Mi Tienda' },
    { variable_name: 'restaurant_phone', variable_key: '{{restaurant_phone}}', description: 'Telefono del tienda', example_value: '+34912345678' },
    { variable_name: 'restaurant_address', variable_key: '{{restaurant_address}}', description: 'Direccion del tienda', example_value: 'Calle Mayor 1' }
  ],
  pedidotion_confirmed: [
    { variable_name: 'name', variable_key: '{{name}}', description: 'Nombre del cliente', example_value: 'Juan Garcia' },
    { variable_name: 'date', variable_key: '{{date}}', description: 'Fecha de la pedido', example_value: '25 de Diciembre' },
    { variable_name: 'time', variable_key: '{{time}}', description: 'Hora de la pedido', example_value: '21:00' },
    { variable_name: 'guests', variable_key: '{{guests}}', description: 'Numero de personas', example_value: '4' },
    { variable_name: 'restaurant_name', variable_key: '{{restaurant_name}}', description: 'Nombre del tienda', example_value: 'Mi Tienda' }
  ],
  follow_up: [
    { variable_name: 'name', variable_key: '{{name}}', description: 'Nombre del cliente', example_value: 'Juan Garcia' },
    { variable_name: 'days_since', variable_key: '{{days_since}}', description: 'Dias desde ultimo contacto', example_value: '3' },
    { variable_name: 'restaurant_name', variable_key: '{{restaurant_name}}', description: 'Nombre del tienda', example_value: 'Mi Tienda' }
  ]
};

/**
 * GET /api/automations/messages/variables
 *
 * Obtener variables disponibles para un trigger especifico
 *
 * Query params:
 * - trigger: Tipo de trigger (opcional, si no se pasa devuelve todas)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger') as MessageTrigger | null;

    // Intentar obtener de la tabla message_variables
    let query = supabase
      .from('message_variables')
      .select('*')
      .order('variable_name');

    if (trigger) {
      query = query.eq('trigger', trigger);
    }

    const { data: dbVariables, error } = await query;

    // Si hay error o no hay datos, usar variables por defecto
    if (error || !dbVariables || dbVariables.length === 0) {
      if (trigger) {
        return NextResponse.json({
          trigger,
          variables: DEFAULT_VARIABLES[trigger] || []
        });
      }

      return NextResponse.json({
        variables: DEFAULT_VARIABLES
      });
    }

    // Agrupar por trigger si no se especifico uno
    if (!trigger) {
      const grouped: Record<string, typeof dbVariables> = {};
      for (const v of dbVariables) {
        if (!grouped[v.trigger]) grouped[v.trigger] = [];
        grouped[v.trigger].push(v);
      }
      return NextResponse.json({ variables: grouped });
    }

    return NextResponse.json({
      trigger,
      variables: dbVariables
    });

  } catch (error) {
    console.error('Error fetching message variables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
