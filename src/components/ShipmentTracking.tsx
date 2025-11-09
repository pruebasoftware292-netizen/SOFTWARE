interface ShipmentTrackingProps {
  currentStep: number;
}

export function ShipmentTracking({ currentStep }: ShipmentTrackingProps) {
  return (
    <div className="py-8">
      <h3 className="text-2xl font-bold text-center mb-12" style={{ color: '#2c5066' }}>
        PROCESO DE SEGUIMIENTO DE DESPACHO ADUANERO
      </h3>

      <div className="relative max-w-6xl mx-auto">
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: '#2c5066', backgroundColor: '#ffffff' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2c5066" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M9 15h6"/>
                <path d="M9 11h6"/>
                <circle cx="12" cy="16" r="2" fill="#2c5066"/>
                <path d="M10 14l2 2 4-4" stroke="#2c5066" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-center font-bold text-sm" style={{ color: '#2c5066' }}>1. Documentación</p>
            <p className="text-center text-sm" style={{ color: '#2c5066' }}>previa</p>
          </div>

          <div className="text-4xl font-bold" style={{ color: '#2c5066' }}>→</div>

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: '#2c5066', backgroundColor: '#ffffff' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2c5066" strokeWidth="1.5">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
                <rect x="8" y="10" width="8" height="6" fill="#b0d4e3"/>
                <rect x="10" y="7" width="4" height="3" fill="#b0d4e3"/>
              </svg>
            </div>
            <p className="text-center font-bold text-sm" style={{ color: '#2c5066' }}>2. Embarque</p>
            <p className="text-center text-sm" style={{ color: '#2c5066' }}>en origen</p>
          </div>

          <div className="text-4xl font-bold" style={{ color: '#2c5066' }}>→</div>

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: '#2c5066', backgroundColor: '#ffffff' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2c5066" strokeWidth="1.5">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
                <rect x="9" y="10" width="2" height="2" fill="#b0d4e3"/>
                <rect x="9" y="14" width="2" height="2" fill="#b0d4e3"/>
                <path d="M9 6h2v2H9z" fill="#b0d4e3"/>
                <text x="15" y="17" fontSize="8" fontWeight="bold" fill="#2c5066">DAM</text>
              </svg>
            </div>
            <p className="text-center font-bold text-sm" style={{ color: '#2c5066' }}>3. Arribo al puerto</p>
            <p className="text-center text-sm" style={{ color: '#2c5066' }}>y transmisión DAM</p>
          </div>

          <div className="text-4xl font-bold" style={{ color: '#2c5066' }}>→</div>

          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: '#2c5066', backgroundColor: '#ffffff' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2c5066" strokeWidth="1.5">
                <rect x="8" y="2" width="8" height="14" rx="1" fill="#b0d4e3"/>
                <path d="M9 7h6M9 10h6M9 13h4"/>
                <circle cx="12" cy="19" r="3" fill="#2c5066"/>
                <path d="M12 17v4M10 19h4" stroke="#ffffff" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-center font-bold text-sm" style={{ color: '#2c5066' }}>4. Canal asignado</p>
            <p className="text-center text-sm" style={{ color: '#2c5066' }}>y levante</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Este diagrama muestra las etapas principales del proceso de despacho aduanero.
        </p>
      </div>
    </div>
  );
}
