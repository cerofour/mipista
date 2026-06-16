import { useState } from 'react'
import type { Point, Priority } from '../types'

// shadcn/ui imports (Adjust paths based on your project structure)
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react";

import lowPCrackIllustration from "../assets/HelpLow.svg"
import midPCrackIllustration from "../assets/HelpMid.svg"
import highPCrackIllustration from "../assets/HelpHigh.svg"

interface CrackIllustrationProps {
  level: Priority
  selected: boolean
}

const CrackIllustration = ({ level, selected }: CrackIllustrationProps) => {
  const images: Record<Priority, string> = {
    bajo: lowPCrackIllustration,
    medio: midPCrackIllustration,
    alto: highPCrackIllustration
  }

  return (
    <Card 
      className={cn(
        "flex flex-col overflow-hidden cursor-pointer transition-all duration-200 border-2 bg-[#1c1c1e]",
        // Selected state: White border as requested
        selected 
          ? "border-white opacity-100 scale-[1.02]" 
          // Unselected state: Transparent border and slightly faded
          : "border-transparent opacity-50 hover:opacity-80"
      )}
    >
      <div className="px-3 pt-2 pb-1">
        <span className="text-white text-[15px] font-medium capitalize tracking-wide">
          {level}
        </span>
      </div>
      <img 
        src={images[level]} 
        alt={`Prioridad ${level}`} 
        className="w-full object-cover" 
      />
    </Card>
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 " onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-neutral-0 rounded-t-[2rem] px-6 pt-5 pb-8">
        <div className="w-12 h-1.5  rounded-full mx-auto mb-6" />

        <h2 className="text-white font-bold text-xl mb-1">Envía un Reporte</h2>
        <p className="text-slate-400 text-sm mb-6">
          {point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : 'Ubicación actual'}
        </p>

        {/* Priorities Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['bajo', 'medio', 'alto'] as Priority[]).map(level => (
            <div key={level} onClick={() => setPrioridad(level)}>
              <CrackIllustration level={level} selected={prioridad === level} />
            </div>
          ))}
        </div>

        {/* Image Upload Label */}
        <label className="flex items-center gap-3 bg-neutral-3 rounded-xl p-4 mb-4 cursor-pointer hover:bg-neutral-2/80 transition-colors">
          <span className="text-white text-sm truncate flex-1">
            {file ? file.name : (
              <div className="flex gap-2 items-center">
              <Camera className="" />
              Agregar imagen (Opcional)
              </div>
            )
            }
          </span>
          {file && (
            <button 
              onClick={e => { e.preventDefault(); setFile(null) }} 
              className="text-white hover:text-white transition-colors text-lg leading-none px-2"
            >
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

        {/* Textarea Configuration */}
        <div className="relative mb-6">
          <Textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Escribe un comentario (opcional)"
            maxLength={120}
            rows={3}
            className="w-full bg-neutral-3 text-white rounded-xl p-4 pb-8 text-sm resize-none border-neutral-2 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 placeholder:text-black-300"
          />
          <p className="absolute bottom-3 right-4 text-white text-xs">
            {descripcion.length}/120
          </p>
        </div>

        {/* Action Buttons */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-semibold mb-3 transition-colors"
        >
          {submitting ? 'Enviando...' : 'Enviar Reporte'}
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onClose} 
          className="w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl py-6"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}