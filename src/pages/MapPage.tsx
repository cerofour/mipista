import MapView from '../components/MapView'
import ReportModal from '../components/ReportModal'
import ReportListModal from '../components/ReportListModal'
import Toast from '../components/Toast'
import { useMapController } from '../hooks/useMapController'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router'

export default function MapPage() {
  const { largeTouchTargets, isOnline, pendingReportsCount } = useApp()
  const navigate = useNavigate()

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
    centerOnGPS,
    handleReportSubmit
  } = useMapController()

  return (
    <div className="relative w-full h-dvh bg-slate-900 overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Offline connectivity banner */}
      {!isOnline && (
        <div
          className="absolute top-0 left-0 right-0 z-[1100] bg-orange-600 text-white text-center py-2 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-top duration-300"
          role="alert"
          aria-live="assertive"
        >
          📡 Sin conexión — Los reportes se guardarán localmente
        </div>
      )}

      <main id="map-content" className="absolute inset-0">
        <MapView onMapClick={handleMapClick} />
      </main>

      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={centerOnGPS}
          aria-label="Centrar mapa en tu ubicación GPS"
          className={`bg-white/95 backdrop-blur rounded-full flex items-center gap-2 font-medium shadow-lg active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            largeTouchTargets 
              ? 'px-6 py-4 min-h-[64px] text-base font-semibold' 
              : 'px-4 py-2.5 min-h-[44px] text-sm'
          }`}
        >
          <span aria-hidden="true" className={`text-blue-500 ${largeTouchTargets ? 'text-xl' : 'text-base'}`}>◎</span>
          <span className="text-slate-700">Ubicación por GPS</span>
        </button>
      </div>

      <div className={`absolute left-4 z-[1000] ${largeTouchTargets ? 'top-24' : 'top-20'}`}>
        <button
          onClick={() => setShowListModal(true)}
          aria-label={`Ver lista de reportes${pendingReportsCount > 0 ? `, ${pendingReportsCount} pendientes` : ''}`}
          className={`relative bg-white/95 backdrop-blur rounded-full flex items-center gap-2 font-medium shadow-lg active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            largeTouchTargets 
              ? 'px-6 py-4 min-h-[64px] text-base font-semibold' 
              : 'px-4 py-2.5 min-h-[44px] text-sm'
          }`}
        >
          <span aria-hidden="true" className={`text-blue-500 ${largeTouchTargets ? 'text-xl' : 'text-base'}`}>📄</span>
          <span className="text-slate-700">Ver Lista</span>
          {pendingReportsCount > 0 && (
            <span
              className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1 shadow-md animate-in zoom-in duration-200"
              aria-hidden="true"
            >
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => navigate('/configuration')}
          aria-label="Configuración de la aplicación"
          className={`bg-slate-900/90 backdrop-blur text-white flex items-center justify-center shadow-lg border border-slate-700 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full ${
            largeTouchTargets 
              ? 'w-16 h-16 text-3xl' 
              : 'w-11 h-11 text-xl'
          }`}
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
          <p className={`text-white mb-5 ${largeTouchTargets ? 'text-lg font-medium' : 'text-base'}`}>
            <span className="sr-only">Localización: </span>
            {displayAddress()}
          </p>

          <button
            onClick={() => setShowReportModal(true)}
            className={`w-full bg-slate-700 hover:bg-slate-600 text-white rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 mb-2.5 font-medium ${
              largeTouchTargets 
                ? 'py-6 text-xl min-h-[64px]' 
                : 'py-4 text-base min-h-[44px]'
            }`}
          >
            Reportar Bache
          </button>

          <button
            onClick={handleQuickReport}
            aria-pressed={quickStep === 1}
            aria-describedby="quick-hint"
            className={`w-full rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 mb-2 font-semibold ${
              largeTouchTargets 
                ? 'py-6 text-xl min-h-[64px]' 
                : 'py-4 text-base min-h-[44px]'
            } ${
              quickStep === 1
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
            className={`w-full text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded-lg ${
              largeTouchTargets 
                ? 'py-4 text-base min-h-[64px]' 
                : 'py-1.5 text-sm min-h-[44px]'
            }`}
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