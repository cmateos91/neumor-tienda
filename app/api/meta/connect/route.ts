import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 1. Obtenemos el ID del cliente. 
  // Prioridad: Query param -> Variable de entorno -> Fallback
  const clienteId = searchParams.get('clienteId') || process.env.NEXT_PUBLIC_RESTAURANTE_ID;

  if (!clienteId) {
    return NextResponse.json({ error: 'Falta configurar el ID del restaurante' }, { status: 500 });
  }

  // 2. Detectamos dinámicamente el dominio actual para saber dónde volver
  // Esto hace que funcione en localhost, en Vercel Preview y en Producción automáticamente.
  const host = request.headers.get('host'); // ej: neumor-restaurante.vercel.app
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const RETURN_URL = `${protocol}://${host}/admin/integraciones`;

  const coreUrl = process.env.CORE_API_BASE_URL;
  
  try {
    // 3. Pedimos al CORE que nos fabrique la URL de login de Facebook
    const response = await fetch(
      `${coreUrl}/api/meta/login-url?clienteId=${clienteId}&redirectAfterAuth=${RETURN_URL}`, 
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del Core (${response.status}): ${errorText}`);
    }
  
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error conectando con Core:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}