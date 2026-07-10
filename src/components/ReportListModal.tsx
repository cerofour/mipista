import { useEffect, useRef } from 'react'
import type { Point, Report } from '../types'
import { Button } from "@/components/ui/button"

interface ReportListModalProps {
  reports: Report[]
  onClose: () => void
  onSelectReport: (point: Point) => void
}

const PRIORITIES = {
  alto: { color: 'text-red-400', label: 'Alto' },
  medio: { color: 'text-orange-400', label: 'Medio' },
  bajo: { color: 'text-blue-400', label: 'Bajo' }
}

export default function ReportListModal({ reports, onClose, onSelectReport }: ReportListModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  return (
    <div 
      className="absolute inset-0 z-[2000] flex flex-col bg-slate-900"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-modal-title"
    >
      <div className="flex-none p-4 pb-2 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h2 id="list-modal-title" className="text-xl font-bold text-white">Lista de Reportes</h2>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Cerrar vista de lista"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {reports.length === 0 ? (
          <p className="text-slate-400 text-center mt-10">No hay reportes activos en esta zona.</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className={`font-semibold ${PRIORITIES[r.prioridad].color}`}>
                      Severidad: {PRIORITIES[r.prioridad].label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.imagen_url && (
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Con foto</span>
                  )}
                </div>
                
                {r.descripcion && (
                  <p className="text-sm text-slate-300 mb-4">{r.descripcion}</p>
                )}

                <Button
                  onClick={() => onSelectReport({ lat: r.lat, lng: r.lng })}
                  variant="outline"
                  className="w-full mt-2 bg-transparent text-white border-slate-600 hover:bg-slate-700
                             focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px]"
                  aria-label={`Ver reporte de prioridad ${r.prioridad} en el mapa`}
                >
                  Ver en Mapa
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
