import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import ReportModal, { type ReportSubmitData } from '../components/ReportModal'
import Toast from '../components/Toast'
import type { Point } from '../types'
import { useReverseGeocode } from '../lib/useReverseGeoCode'

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
  const { address: selectedAddress, loading: selectedLoading } = useReverseGeocode(selectedPoint)
  const { address: currentAddress, loading: currentLoading }   = useReverseGeocode(userLocation)

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
      () => { if (!cached) setUserLocation(CHICLAYO) },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, []) // eslint-disable-line

  const handleMapClick = (point: Point) => {
    setSelectedPoint(point)
    setUserLocation(point)
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
      showToast('Error al enviar reporte', 'error')
    } else {
      showToast('Reporte enviado correctamente')
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

      {toast && <Toast message={toast.message} type={toast.type} />}

      <main id="map-content" className="absolute inset-0">
        <MapView onMapClick={handleMapClick} />
      </main>

      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => userLocation && setUserLocation({ ...userLocation })}
          aria-label="Centrar mapa en tu ubicación GPS"
          className="bg-white/95 backdrop-blur rounded-full px-4 py-2.5 min-h-[44px]
                     flex items-center gap-2 text-sm font-medium shadow-lg
                     active:scale-95 transition-transform
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span aria-hidden="true" className="text-blue-500 text-base">◎</span>
          <span className="text-slate-700">Ubicación por GPS</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={handleSignOut}
          aria-label="Cerrar sesión"
          className="bg-slate-900/90 backdrop-blur text-white w-11 h-11
                     rounded-full flex items-center justify-center shadow-lg
                     border border-slate-700 active:scale-95 transition-transform text-xl
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <span aria-hidden="true">≡</span>
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-[1000]"
        role="region"
        aria-label={selectedPoint ? 'Panel de reporte de bache' : 'Panel de ubicación'}
      >
        {selectedPoint ? (
          <div className="bg-neutral-1 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl border-t border-slate-800">
            <div aria-hidden="true" className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

            <p className="text-white text-xl mb-0.5">Ubicación seleccionada</p>
            <p className="text-white font-semibold text-base mb-5">
              <span className="sr-only">Coordenadas: </span>
              {selectedLoading
                ? 'Buscando dirección...'
                : selectedAddress ?? `${selectedPoint!.lat.toFixed(5)}, ${selectedPoint!.lng.toFixed(5)}`}
            </p>


            <button
              onClick={() => setShowReportModal(true)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white
                         rounded-2xl py-4 mb-2.5 font-medium transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Reportar Bache
            </button>

            <button
              onClick={handleQuickReport}
              aria-pressed={quickStep === 1}
              aria-describedby="quick-hint"
              className={`w-full rounded-2xl py-4 font-semibold mb-2 transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                ${quickStep === 1
                  ? 'bg-orange-500 text-white scale-[1.02]'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              {quickStep === 1
                ? 'Toca de nuevo para confirmar'
                : 'Reporte Rápido (2 Taps)'}
            </button>

            <p id="quick-hint" className="sr-only">
              {quickStep === 1
                ? 'Primer tap registrado. Toca nuevamente para enviar el reporte rápido.'
                : 'Envía un reporte de prioridad media con dos toques.'}
            </p>

            <button
              onClick={dismissPanel}
              className="w-full text-slate-400 text-sm py-1.5 min-h-[44px]
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-slate-500 rounded-lg"
            >
              Cancelar
            </button>
          </div>

        ) : (
          <div className="bg-neutral-1 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl border-t border-neutral-2">
            <div aria-hidden="true" className="w-10 h-1 bg-neutral-1 rounded-full mx-auto mb-3" />

            <p className="text-white font-semibold text-sm">Ubicación en tiempo real</p>

            <p className="text-gray-200 text-sm mt-0.5 mb-3" aria-live="polite">
              {currentLoading ? 'Buscando dirección...' : currentAddress ?? locationLabel}
            </p>

            <p className="text-gray-400 text-sm text-center">
              Toca cualquier punto del mapa para reportar un bache
            </p>
          </div>
        )}
      </div>

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