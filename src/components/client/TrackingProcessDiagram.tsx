export function TrackingProcessDiagram() {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-gray-200">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-600 tracking-wide">
        PROCESO DE SEGUIMIENTO DE DESPACHO ADUANERO
      </h2>

      <div className="relative max-w-6xl mx-auto">
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-36 h-36 rounded-full border-4 border-blue-300 bg-blue-50 flex items-center justify-center mb-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M9 15h6"/>
                <path d="M9 11h6"/>
                <circle cx="12" cy="16" r="2" fill="#2563eb"/>
                <path d="M10 14l2 2 4-4" stroke="#2563eb" strokeWidth="2"/>
              </svg>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-5 py-3 border border-blue-400 shadow-md">
              <p className="text-center font-bold text-base text-white">1. Documentación</p>
              <p className="text-center text-sm text-blue-50">previa</p>
            </div>
          </div>

          <div className="text-5xl font-bold text-blue-400">→</div>

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-36 h-36 rounded-full border-4 border-teal-300 bg-teal-50 flex items-center justify-center mb-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
                <rect x="8" y="10" width="8" height="6" fill="#5eead4"/>
                <rect x="10" y="7" width="4" height="3" fill="#5eead4"/>
              </svg>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl px-5 py-3 border border-teal-400 shadow-md">
              <p className="text-center font-bold text-base text-white">2. Embarque</p>
              <p className="text-center text-sm text-teal-50">en origen</p>
            </div>
          </div>

          <div className="text-5xl font-bold text-blue-400">→</div>

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-36 h-36 rounded-full border-4 border-amber-300 bg-amber-50 flex items-center justify-center mb-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
                <rect x="9" y="10" width="2" height="2" fill="#fbbf24"/>
                <rect x="9" y="14" width="2" height="2" fill="#fbbf24"/>
                <path d="M9 6h2v2H9z" fill="#fbbf24"/>
                <text x="15" y="17" fontSize="8" fontWeight="bold" fill="#f59e0b">DAM</text>
              </svg>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl px-5 py-3 border border-amber-400 shadow-md">
              <p className="text-center font-bold text-base text-white">3. Arribo al puerto</p>
              <p className="text-center text-sm text-amber-50">y transmisión DAM</p>
            </div>
          </div>

          <div className="text-5xl font-bold text-blue-400">→</div>

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-36 h-36 rounded-full border-4 border-green-300 bg-green-50 flex items-center justify-center mb-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5">
                <rect x="8" y="2" width="8" height="14" rx="1" fill="#6ee7b7"/>
                <path d="M9 7h6M9 10h6M9 13h4"/>
                <circle cx="12" cy="19" r="3" fill="#059669"/>
                <path d="M12 17v4M10 19h4" stroke="#f0fdf4" strokeWidth="2"/>
              </svg>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl px-5 py-3 border border-green-400 shadow-md">
              <p className="text-center font-bold text-base text-white">4. Canal asignado</p>
              <p className="text-center text-sm text-green-50">y levante</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
        <p className="text-base text-slate-700 font-medium">
          Este diagrama muestra las etapas principales del proceso de despacho aduanero.
        </p>
        <p className="text-sm text-slate-600 mt-2">
          Para ver el estado específico de cada despacho, selecciona uno de la lista superior.
        </p>
      </div>
    </div>
  );
}
