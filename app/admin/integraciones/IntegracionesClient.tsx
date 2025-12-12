"use client";

import { useSearchParams } from "next/navigation";

export function IntegracionesClient() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  
  // Leemos el ID desde la variable pública (configuración de la plantilla)
  const restauranteId = process.env.NEXT_PUBLIC_RESTAURANTE_ID;

  const handleConnectClick = async () => {
    try {
      // Llamamos a nuestro propio backend, pasando el ID
      const res = await fetch(`/api/meta/connect?clienteId=${restauranteId}`);
      const data = await res.json();

      if (data.url) {
        // Redirigimos a Facebook -> Core -> Vuelta aquí
        window.location.href = data.url; 
      } else {
        alert("Error: No se recibió URL de conexión. Revisa la consola.");
        console.error("Respuesta:", data);
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-2">Estado de la conexión</h3>
        
        {connected === "meta_ok" ? (
          <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
            <span className="text-xl mr-2">✅</span>
            <div>
              <p className="font-semibold">Conectado exitosamente</p>
              <p className="text-sm opacity-90">Tu cuenta de Meta está lista para automatizaciones.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-4 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 mb-4">
            <span className="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
            <p>No conectado</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleConnectClick}
            disabled={connected === "meta_ok"}
            className={`
              w-full sm:w-auto inline-flex items-center justify-center
              rounded-lg px-6 py-3
              text-sm font-medium text-white
              transition-all duration-200
              ${connected === "meta_ok" 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-[#1877F2] hover:bg-[#166fe5] shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {connected === "meta_ok" ? 'Cuenta Vinculada' : 'Conectar con Facebook / Instagram'}
          </button>
        </div>
      </div>
    </div>
  );
}