// app/api/meta/connect/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Simulamos que obtenemos el ID del cliente actual (desde sesión o config)
  // En producción esto vendría de tu auth o DB del restaurante
  const CLIENTE_ID_ACTUAL = '123e4567-e89b-12d3-a456-426614174000'; // UUID ejemplo
  
  // URL a la que queremos volver cuando Meta termine
  // Debe ser la URL pública del panel admin de este restaurante
  const RETURN_URL = 'https://neumor-restaurante.vercel.app/'; // O tu dominio prod

  const coreUrl = process.env.CORE_API_BASE_URL;
  
  // Llamamos al Core para que fabrique la URL
  const res = await fetch(`${coreUrl}/api/meta/login-url?clienteId=${CLIENTE_ID_ACTUAL}&redirectAfterAuth=${RETURN_URL}`, {
    cache: 'no-store'
  });
  
  const data = await res.json();

  return NextResponse.json(data);
}