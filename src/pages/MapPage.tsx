import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import ReportModal, { type ReportSubmitData } from '../components/ReportModal'
import Toast from '../components/Toast'
import type { Point } from '../types'

export default function MapPage() {
  const {
    userLocation, setUserLocation,
    fetchReports,
    selectedPoint, setSelectedPoint,
    showReportModal, setShowReportModal,
    toast, showToast,
    CHICLAYO
  } = useApp()

  const [quickStep, setQuickStep] = useState(0)
  const quickTimer = useRef<ReturnType<typeof setTimeout>>(0)

  useEffect(() => {
    fetchReports()

    const cached = localStorage.getItem('mipista_lastloc')
    if (cached) setUserLocation(JSON.parse(cached) as Point)

    if (!navigator.geolocation) {
      if (!cached) setUserLocation(CHICLAYO)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const loc: Point = { lat: coords.latitude, lng: coords.longitude }
        setUserLocation(loc)
        localStorage.setItem('mipista_lastloc', JSON.stringify(loc))
      },
      () => {
        if (!cached) setUserLocation(CHICLAYO)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, []) // eslint-disable-line

  const handleMapClick = (point: Point) => {
    setSelectedPoint(point)
    setQuickStep(0)
    clearTimeout(quickTimer.current)
  }

  const handleQuickReport = () => {
    if (quickStep === 0) {
      setQuickStep(1)
      quickTimer.current = setTimeout(() => setQuickStep(0), 4000)
    } else {
      clearTimeout(quickTimer.current)
      sendReport({ prioridad: 'medio', descripcion: null, file: null })
      dismissPanel()
    }
  }

  const sendReport = async ({ prioridad, descripcion, file }: ReportSubmitData) => {
    const point = selectedPoint ?? userLocation
    if (!point) return

    let imagen_url: string | null = null

    if (file) {
      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('bache-images')
        .upload(path, file, { contentType: file.type })

      if (!uploadErr) {
        const { data } = supabase.storage.from('bache-images').getPublicUrl(path)
        imagen_url = data.publicUrl
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('reportes_baches').insert({
      user_id: user.id,
      lat: point.lat,
      lng: point.lng,
      prioridad,
      descripcion,
      imagen_url
    })

    if (error) {
      showToast('❌ Error al enviar reporte', 'error')
    } else {
      showToast('✅ Reporte enviado')
      fetchReports()
    }
  }

  const dismissPanel = () => {
    setSelectedPoint(null)
    setQuickStep(0)
    clearTimeout(quickTimer.current)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const locationLabel = userLocation
    ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
    : 'Localizando...'

  return (
    <div className="relative w-full h-dvh bg-slate-900 overflow-hidden">

      {/* Toast flotante */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Mapa (full-screen base) */}
      <div className="absolute inset-0">
        <MapView onMapClick={handleMapClick} />
      </div>

      {/* ── Botón GPS — top left ── */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => userLocation && setUserLocation({ ...userLocation })}
          className="bg-white/95 backdrop-blur rounded-full px-4 py-2.5 
                     flex items-center gap-2 text-sm font-medium shadow-lg active:scale-95 transition-transform"
        >
          <span className="text-blue-500 text-base">◎</span>
          <span className="text-slate-700">Ubicación por GPS</span>
        </button>
      </div>

      {/* ── Menú — top right ── */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={handleSignOut}
          className="bg-slate-900/90 backdrop-blur text-white w-11 h-11 
                     rounded-full flex items-center justify-center shadow-lg 
                     border border-slate-700 active:scale-95 transition-transform text-xl"
        >
          ≡
        </button>
      </div>

      {/* ── Panel inferior ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]">

        {selectedPoint ? (
          /* Panel de acción cuando hay punto seleccionado */
          <div className="bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl border-t border-slate-800">
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

            <p className="text-slate-400 text-xs mb-0.5">Punto seleccionado</p>
            <p className="text-white font-semibold text-base mb-5">
              {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}
            </p>

            {/* Reportar con formulario */}
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white 
                         rounded-2xl py-4 mb-2.5 font-medium transition-colors"
            >
              Reportar Bache
            </button>

            {/* Reporte rápido — 2 taps */}
            <button
              onClick={handleQuickReport}
              className={`w-full rounded-2xl py-4 font-semibold mb-2 transition-all ${
                quickStep === 1
                  ? 'bg-orange-500 text-white scale-[1.02]'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {quickStep === 1
                ? '⚡ Toca de nuevo para confirmar'
                : 'Reporte Rápido (2 Taps)'}
            </button>

            <button
              onClick={dismissPanel}
              className="w-full text-slate-400 text-sm py-1.5"
            >
              Cancelar
            </button>
          </div>

        ) : (
          /* Panel de ubicación por defecto */
          <div className="bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl border-t border-slate-800">
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-3" />
            <p className="text-white font-semibold text-sm">Ubicación en tiempo real</p>
            <p className="text-slate-400 text-xs mt-0.5 mb-3">{locationLabel}</p>
            <p className="text-slate-500 text-xs text-center">
              Toca cualquier punto del mapa para reportar un bache
            </p>
          </div>
        )}
      </div>

      {/* ── Modal de reporte detallado ── */}
      {showReportModal && (
        <ReportModal
          point={selectedPoint}
          onClose={() => setShowReportModal(false)}
          onSubmit={async (data) => {
            await sendReport(data)
            setShowReportModal(false)
            dismissPanel()
          }}
        />
      )}
    </div>
  )
}