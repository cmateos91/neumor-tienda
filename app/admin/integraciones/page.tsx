'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function IntegracionesPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const isConnected = searchParams.get('connected') === 'true';

  const handleConnect = async () => {
    try {
      setLoading(true);
      // Pedimos a nuestro backend la URL (que a su vez la pide al Core)
      const res = await fetch('/api/meta/connect');
      const data = await res.json();
      
      if (data.url) {
        // Redirigimos al usuario a Facebook
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      alert('Error al iniciar conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Integraciones</h1>
      
      <div className="p-6 border rounded-lg shadow-sm bg-white max-w-md">
        <h2 className="text-lg font-semibold mb-2">Meta (Facebook & Instagram)</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Conecta tu cuenta para automatizar publicaciones y responder mensajes.
        </p>

        {isConnected ? (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
            ✅ Cuenta conectada exitosamente
          </div>
        ) : (
          <div className="bg-gray-100 text-gray-800 p-3 rounded mb-4">
            ⚪ No conectado
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading || isConnected}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Iniciando...' : isConnected ? 'Reconectar' : 'Conectar con Meta'}
        </button>
      </div>
    </div>
  );
}