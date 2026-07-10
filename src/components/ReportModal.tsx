import { useState, useRef, useEffect } from 'react'
import type { Point, Priority } from '../types'
import { useReverseGeocode } from '../lib/useReverseGeoCode'
import { useApp } from '../context/AppContext'

// shadcn/ui imports (Adjust paths based on your project structure)
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react";

import lowPCrackIllustration from "../assets/HelpLow.svg"
import midPCrackIllustration from "../assets/HelpMid.svg"
import highPCrackIllustration from "../assets/HelpHigh.svg"

import { ReportSubmitData } from '@/lib/service/sendReport'

const PRIORITY_LABELS: Record<Priority, string> = {
  bajo:  'Bajo — grieta superficial',
  medio: 'Medio — bache moderado',
  alto:  'Alto — bache severo',
}

interface CrackIllustrationProps {
  level: Priority
  selected: boolean
  large?: boolean
}

interface ReportModalProps {
  point: Point | null
  onClose: () => void
  onSubmit: (data: ReportSubmitData) => Promise<void>
}


const CrackIllustration = ({ level, selected, large }: CrackIllustrationProps) => {
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
      <div className={cn("pt-2 pb-1", large ? "px-4 py-3" : "px-3")}>
        <span className={cn("text-white font-medium capitalize tracking-wide", large ? "text-[18px]" : "text-[15px]")}>
          {level}
        </span>
      </div>
      <img 
        src={images[level]} 
        alt={PRIORITY_LABELS[level]} 
        className="w-full object-cover" 
      />
    </Card>
  )
}

export default function ReportModal({ point, onClose, onSubmit }: ReportModalProps) {
  const { largeTouchTargets } = useApp()
  const [prioridad, setPrioridad]     = useState<Priority>('medio')
  const [descripcion, setDescripcion] = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [fileError, setFileError]   = useState<string | null>(null)
  const { address, loading: addressLoading } = useReverseGeocode(point)

  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    await onSubmit({ point, prioridad, descripcion: descripcion.trim() || null, file })
    setSubmitting(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    if (selected && !selected.type.startsWith('image/')) {
      setFileError('Solo se permiten archivos de imagen (JPG, PNG, WEBP).')
      setFile(null)
    } else {
      setFileError(null)
      setFile(selected)
    }
  }

  return (
    <div className="absolute inset-0 z-[2000] flex flex-col justify-end" role="dialog"
      aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 " aria-hidden="true" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-neutral-0 rounded-t-[2rem] px-6 pt-5 pb-8">
        <div className="w-12 h-1.5  rounded-full mx-auto mb-6" aria-hidden="true" />

        <h2 id="modal-title" ref={headingRef} tabIndex={-1} className={`text-white font-bold mb-1 ${largeTouchTargets ? 'text-2xl' : 'text-xl'}`}>Envía un Reporte</h2>
        <p className={`text-slate-400 mb-6 ${largeTouchTargets ? 'text-base' : 'text-sm'}`}>
          {addressLoading
            ? 'Buscando dirección...'
            : address ?? (point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : 'Ubicación actual')}
        </p>

        {/* Priorities Grid */}
        <fieldset className="mb-6">
          <legend className={`text-slate-300 mb-3 ${largeTouchTargets ? 'text-base font-medium' : 'text-sm'}`}>
            Selecciona la severidad del bache
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {(['bajo', 'medio', 'alto'] as Priority[]).map(level => (

              <button
                key={level}
                type="button"
                onClick={() => setPrioridad(level)}
                aria-label={PRIORITY_LABELS[level]}
                aria-pressed={prioridad === level}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl transition-all ${
                  largeTouchTargets ? 'min-h-[64px]' : 'min-h-[44px]'
                }`}
              >
                <CrackIllustration level={level} selected={prioridad === level} large={largeTouchTargets} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mb-4">
          <label
            htmlFor="file-input"
            className={`flex items-center gap-3 bg-neutral-3 rounded-xl cursor-pointer
              hover:bg-neutral-2/80 transition-colors focus-within:ring-2 focus-within:ring-white ${
                largeTouchTargets ? 'p-6 min-h-[64px]' : 'p-4 min-h-[44px]'
              }`}
          >
            <span className={`text-white truncate flex-1 ${largeTouchTargets ? 'text-base font-semibold' : 'text-sm'}`}>
              {file ? file.name : (
                <span className="flex gap-2 items-center">

                  <Camera aria-hidden="true" className={largeTouchTargets ? 'w-6 h-6' : 'w-4 h-4'} />
                  Agregar imagen (Opcional)
                </span>
              )}
            </span>
            {file && (

              <button
                type="button"
                onClick={e => { e.preventDefault(); setFile(null); setFileError(null) }}
                aria-label="Quitar imagen seleccionada"
                className={`text-white hover:text-white transition-colors leading-none px-2
                  flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded ${
                    largeTouchTargets ? 'min-w-[64px] min-h-[64px] text-xl' : 'min-w-[44px] min-h-[44px] text-lg'
                  }`}
              >
                ✕
              </button>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
              aria-describedby={fileError ? 'file-error' : undefined}
            />
          </label>

          {fileError && (
            <p id="file-error" role="alert" className="text-red-400 text-sm mt-1 px-1">
              ⚠ {fileError}
            </p>
          )}
        </div>

        <div className="relative mb-6">
          <label htmlFor="descripcion" className={`text-slate-300 mb-1 block ${largeTouchTargets ? 'text-base font-semibold' : 'text-sm'}`}>
            Descripción <span className="text-slate-500">(opcional)</span>
          </label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Escribe un comentario"
            maxLength={120}
            rows={3}
            autoComplete="off"
            aria-describedby="char-count"
            className={`w-full bg-neutral-3 text-white rounded-xl p-4 pb-8 resize-none
              border-neutral-2 focus-visible:ring-1 focus-visible:ring-white
              focus-visible:ring-offset-0 placeholder:text-black-300 ${
                largeTouchTargets ? 'text-base min-h-[100px]' : 'text-sm'
              }`}
          />

          <p
            id="char-count"
            aria-live="polite"
            className="absolute bottom-3 right-4 text-white text-sm"
          >
            {descripcion.length}/120
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold mb-3 transition-colors ${
            largeTouchTargets ? 'py-8 text-xl min-h-[64px]' : 'py-6 text-base min-h-[44px]'
          }`}
        >
          {submitting ? 'Enviando...' : 'Enviar Reporte'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className={`w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all ${
            largeTouchTargets ? 'py-8 text-xl min-h-[64px]' : 'py-6 text-base'
          }`}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}