import MapView from '../components/MapView'
import ReportModal from '../components/ReportModal'
import ReportListModal from '../components/ReportListModal'
import Toast from '../components/Toast'
import { useMapController } from '../hooks/useMapController'

export default function MapPage() {
  const {
    setUserLocation,
    reports,
    selectedPoint,
    showReportModal,
    setShowReportModal,
    toast,
    showListModal,
    setShowListModal,
    quickStep,
    displayAddress,
    handleMapClick,
    handleQuickReport,
    dismissPanel,
    handleSignOut,
    centerOnGPS,
    handleReportSubmit
  } = useMapController()

  return (
    <div className="relative w-full h-dvh bg-slate-900 overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main id="map-content" className="absolute inset-0">
        <MapView onMapClick={handleMapClick} />
      </main>

      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={centerOnGPS}
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

      <div className="absolute top-20 left-4 z-[1000]">
        <button
          onClick={() => setShowListModal(true)}
          aria-label="Ver lista de reportes"
          className="bg-white/95 backdrop-blur rounded-full px-4 py-2.5 min-h-[44px]
                     flex items-center gap-2 text-sm font-medium shadow-lg
                     active:scale-95 transition-transform
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span aria-hidden="true" className="text-blue-500 text-base">📄</span>
          <span className="text-slate-700">Ver Lista</span>
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
        <div className="bg-neutral-1 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl border-t border-slate-800">
          <div aria-hidden="true" className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

          <p className="text-white font-semibold text-xl mb-0.5">Ubicación</p>
          <p className="text-white text-base mb-5">
            <span className="sr-only">Localización: </span>
            {displayAddress()}
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

      </div>

      {showReportModal && (
        <ReportModal
          point={selectedPoint}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
        />
      )}

      {showListModal && (
        <ReportListModal
          reports={reports}
          onClose={() => setShowListModal(false)}
          onSelectReport={(p) => {
            setUserLocation(p)
            setShowListModal(false)
          }}
        />
      )}
    </div>
  )
}