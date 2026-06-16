import { JSX, useState } from 'react'
import type { Point, Priority } from '../types'

interface CrackIllustrationProps {
  level: Priority
  selected: boolean
}

const CrackIllustration = ({ level, selected }: CrackIllustrationProps) => {
  const paths: Record<Priority, JSX.Element> = {
    bajo: (
      <svg viewBox="0 0 72 36" className="w-full h-9">
        <rect width="72" height="36" fill="#1e293b" rx="4"/>
        <line x1="4" y1="18" x2="68" y2="18" stroke="#334155" strokeWidth="1.5"/>
        <path d="M28 12 L35 20 L30 28" stroke="#94a3b8" strokeWidth="1.2" fill="none"/>
        <line x1="38" y1="15" x2="44" y2="22" stroke="#94a3b8" strokeWidth="1"/>
      </svg>
    ),
    medio: (
      <svg viewBox="0 0 72 36" className="w-full h-9">
        <rect width="72" height="36" fill="#1e293b" rx="4"/>
        <line x1="4" y1="18" x2="68" y2="18" stroke="#334155" strokeWidth="1.5"/>
        <ellipse cx="36" cy="20" rx="14" ry="9" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
        <path d="M22 14 L28 20 L24 28" stroke="#64748b" strokeWidth="1.3" fill="none"/>
        <path d="M50 13 L44 20 L48 28" stroke="#64748b" strokeWidth="1.3" fill="none"/>
      </svg>
    ),
    alto: (
      <svg viewBox="0 0 72 36" className="w-full h-9">
        <rect width="72" height="36" fill="#1e293b" rx="4"/>
        <line x1="4" y1="18" x2="68" y2="18" stroke="#334155" strokeWidth="1.5"/>
        <ellipse cx="36" cy="21" rx="20" ry="13" fill="#020617" stroke="#475569" strokeWidth="1"/>
        <path d="M16 12 L24 22 L18 34" stroke="#64748b" strokeWidth="1.5" fill="none"/>
        <path d="M56 11 L48 22 L54 34" stroke="#64748b" strokeWidth="1.5" fill="none"/>
        <path d="M30 4 L36 18 L42 4" stroke="#475569" strokeWidth="1" fill="none"/>
      </svg>
    )
  }

  return (
    <div className={`
      rounded-xl p-2 border-2 transition-all cursor-pointer
      ${selected ? 'border-blue-500 bg-slate-700' : 'border-slate-700 bg-slate-800 opacity-60'}
    `}>
      {paths[level]}
      <p className="text-white text-xs font-medium text-center mt-1.5 capitalize">{level}</p>
    </div>
  )
}

export interface ReportSubmitData {
  prioridad: Priority
  descripcion: string | null
  file: File | null
}

interface ReportModalProps {
  point: Point | null
  onClose: () => void
  onSubmit: (data: ReportSubmitData) => Promise<void>
}

export default function ReportModal({ point, onClose, onSubmit }: ReportModalProps) {
  const [prioridad, setPrioridad]     = useState<Priority>('medio')
  const [descripcion, setDescripcion] = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [submitting, setSubmitting]   = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    await onSubmit({ prioridad, descripcion: descripcion.trim() || null, file })
    setSubmitting(false)
  }

  return (
    <div className="absolute inset-0 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl border-t border-slate-700">
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />

        <h2 className="text-white font-bold text-lg">Envía un Reporte</h2>
        <p className="text-slate-400 text-xs mb-5">
          {point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : 'Ubicación actual'}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['bajo', 'medio', 'alto'] as Priority[]).map(level => (
            <div key={level} onClick={() => setPrioridad(level)}>
              <CrackIllustration level={level} selected={prioridad === level} />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 bg-slate-800 rounded-2xl p-3.5 mb-3 cursor-pointer border border-slate-700 active:bg-slate-700 transition-colors">
          <span className="text-xl">📷</span>
          <span className="text-slate-300 text-sm truncate flex-1">
            {file ? file.name : 'Agregar imagen (Opcional)'}
          </span>
          {file && (
            <button onClick={e => { e.preventDefault(); setFile(null) }} className="text-slate-500 text-lg leading-none">
              ✕
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Escribe un comentario (opcional)"
          maxLength={120}
          rows={3}
          className="w-full bg-slate-800 text-slate-200 rounded-2xl p-3.5 text-sm resize-none outline-none placeholder-slate-500 border border-slate-700 focus:border-blue-500 transition-colors"
        />
        <p className="text-slate-500 text-xs mb-4 px-1">{descripcion.length}/120</p>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-2xl py-4 font-semibold mb-2 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Enviar Reporte'}
        </button>
        <button onClick={onClose} className="w-full text-slate-400 py-2 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  )
}