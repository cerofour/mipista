import { useState, useRef, useEffect } from 'react'
import type { Point, Priority } from '../types'
import { useReverseGeocode } from '../lib/useReverseGeoCode'
import { useApp } from '../context/AppContext'
import { useLandscape } from '../hooks/useLandscape'

// shadcn/ui imports (Adjust paths based on your project structure)
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react"

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
  isLandscape?: boolean
}

interface ReportModalProps {
  point: Point | null
  onClose: () => void
  onSubmit: (data: ReportSubmitData) => Promise<void>
}


const CrackIllustration = ({ level, selected, large, isLandscape }: CrackIllustrationProps) => {
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
      <div className={cn("pt-2 pb-1", large ? "px-4 py-3" : "px-3", isLandscape && "py-0.5 px-2")}>
        <span className={cn(
          "text-white font-medium capitalize tracking-wide", 
          large ? "text-[18px]" : "text-[15px]",
          isLandscape && "text-[13px]"
        )}>
          {level}
        </span>
      </div>
      <img 
        src={images[level]} 
        alt={PRIORITY_LABELS[level]} 
        className={cn("w-full object-cover", isLandscape ? "h-10 md:h-12" : "")} 
      />
    </Card>
  )
}

export default function ReportModal({ point, onClose, onSubmit }: ReportModalProps) {
  const { largeTouchTargets } = useApp()
  const isLandscape = useLandscape()
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
    <div 
      className={cn(
        "absolute inset-0 z-[2000] flex", 
        isLandscape ? "flex-row justify-start items-stretch" : "flex-col justify-end"
      )} 
      role="dialog"
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />

      {/* Modal Content */}
      <div 
        className={cn(
          "relative bg-neutral-0 shadow-2xl transition-all duration-300 flex flex-col",
          isLandscape 
            ? "w-[48vw] max-w-[50vw] h-full rounded-r-3xl rounded-l-none border-r border-slate-800 px-5 py-4 overflow-y-auto scrollbar-thin" 
            : "rounded-t-[2rem] px-6 pt-5 pb-8"
        )}
      >
        {!isLandscape && <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-slate-600" aria-hidden="true" />}

        <h2 
          id="modal-title" 
          ref={headingRef} 
          tabIndex={-1} 
          className={cn(
            "text-white font-bold mb-1", 
            largeTouchTargets ? 'text-2xl' : 'text-xl',
            isLandscape && "mb-0.5"
          )}
        >
          Envía un Reporte
        </h2>
        <p className={cn(
          "text-slate-400 mb-6", 
          largeTouchTargets ? 'text-base' : 'text-sm',
          isLandscape && "mb-3 text-xs leading-snug truncate"
        )}>
          {addressLoading
            ? 'Buscando dirección...'
            : address ?? (point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : 'Ubicación actual')}
        </p>

        {/* Priorities Grid */}
        <fieldset className={cn("mb-6", isLandscape && "mb-4")}>
          <legend className={cn(
            "text-slate-300 mb-3", 
            largeTouchTargets ? 'text-base font-medium' : 'text-sm',
            isLandscape && "mb-1.5 text-xs"
          )}>
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
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl transition-all",
                  largeTouchTargets ? 'min-h-[64px]' : 'min-h-[44px]',
                  isLandscape && "min-h-[36px]"
                )}
              >
                <CrackIllustration 
                  level={level} 
                  selected={prioridad === level} 
                  large={largeTouchTargets} 
                  isLandscape={isLandscape} 
                />
              </button>
            ))}
          </div>
        </fieldset>

        {/* Image Attachment Input */}
        <div className={cn("mb-4", isLandscape && "mb-3")}>
          <label
            htmlFor="file-input"
            className={cn(
              "flex items-center gap-3 bg-neutral-3 rounded-xl cursor-pointer hover:bg-neutral-2/80 transition-colors focus-within:ring-2 focus-within:ring-white",
              largeTouchTargets ? 'p-6 min-h-[64px]' : 'p-4 min-h-[44px]',
              isLandscape && "p-2 py-2.5 min-h-[38px] rounded-lg gap-2"
            )}
          >
            <span className={cn(
              "text-white truncate flex-1", 
              largeTouchTargets ? 'text-base font-semibold' : 'text-sm',
              isLandscape && "text-xs"
            )}>
              {file ? file.name : (
                <span className="flex gap-2 items-center">
                  <Camera aria-hidden="true" className={cn(largeTouchTargets ? 'w-6 h-6' : 'w-4 h-4', isLandscape && "w-3.5 h-3.5")} />
                  Agregar imagen (Opcional)
                </span>
              )}
            </span>
            {file && (
              <button
                type="button"
                onClick={e => { e.preventDefault(); setFile(null); setFileError(null) }}
                aria-label="Quitar imagen seleccionada"
                className={cn(
                  "text-white hover:text-white transition-colors leading-none px-2 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded",
                  largeTouchTargets ? 'min-w-[64px] min-h-[64px] text-xl' : 'min-w-[44px] min-h-[44px] text-lg',
                  isLandscape && "min-w-[30px] min-h-[30px] text-sm px-1"
                )}
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

        {/* Description Textarea */}
        <div className={cn("relative mb-6", isLandscape && "mb-4")}>
          <label htmlFor="descripcion" className={cn(
            "text-slate-300 mb-1 block", 
            largeTouchTargets ? 'text-base font-semibold' : 'text-sm',
            isLandscape && "text-xs mb-0.5"
          )}>
            Descripción <span className="text-slate-500">(opcional)</span>
          </label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Escribe un comentario"
            maxLength={120}
            rows={isLandscape ? 2 : 3}
            autoComplete="off"
            aria-describedby="char-count"
            className={cn(
              "w-full bg-neutral-3 text-white rounded-xl p-4 pb-8 resize-none border-neutral-2 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 placeholder:text-black-300",
              largeTouchTargets ? 'text-base min-h-[100px]' : 'text-sm',
              isLandscape && "text-xs p-2.5 pb-6 rounded-lg min-h-[60px]"
            )}
          />

          <p
            id="char-count"
            aria-live="polite"
            className={cn("absolute bottom-3 right-4 text-white text-sm", isLandscape && "bottom-2 right-3 text-xs")}
          >
            {descripcion.length}/120
          </p>
        </div>

        {/* Action Buttons */}
        <div className={cn("flex flex-col gap-2", isLandscape && "flex-row gap-3 mt-auto")}>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold mb-3 transition-colors",
              largeTouchTargets ? 'py-8 text-xl min-h-[64px]' : 'py-6 text-base min-h-[44px]',
              isLandscape && "flex-1 mb-0 py-4 min-h-[38px] text-xs rounded-lg"
            )}
          >
            {submitting ? 'Enviando...' : 'Enviar Reporte'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className={cn(
              "w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all",
              largeTouchTargets ? 'py-8 text-xl min-h-[64px]' : 'py-6 text-base',
              isLandscape && "flex-1 py-4 min-h-[38px] text-xs rounded-lg"
            )}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}