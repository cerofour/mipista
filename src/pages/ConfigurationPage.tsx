import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Lock } from 'lucide-react'
import { speak } from '@/lib/speech'
import { syncService } from '@/services/sync.service'
import { clearAllPending } from '@/lib/offlineStore'

export default function ConfigurationPage() {
  const { 
    largeTouchTargets, setLargeTouchTargets, 
    highContrast, setHighContrast,
    voiceConfirmations, setVoiceConfirmations,
    isOnline, pendingReportsCount, refreshPendingCount,
    offlineStoreImages, setOfflineStoreImages,
    autoSync, setAutoSync,
    showToast
  } = useApp()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)

  const handleLogout = async () => {
    await authService.logout()
    navigate('/')
  }

  const handleVoiceToggle = () => {
    const nextVal = !voiceConfirmations
    setVoiceConfirmations(nextVal)
    if (nextVal) {
      speak('Confirmaciones por voz activadas')
    } else {
      speak('Confirmaciones desactivadas')
    }
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const synced = await syncService.syncPendingReports()
      await refreshPendingCount()
      if (synced > 0) {
        showToast(`${synced} reporte${synced > 1 ? 's' : ''} sincronizado${synced > 1 ? 's' : ''}`)
      } else {
        showToast('No se pudieron sincronizar reportes', 'error')
      }
    } catch {
      showToast('Error al sincronizar', 'error')
    } finally {
      setSyncing(false)
    }
  }

  const handleClearPending = async () => {
    if (window.confirm(`¿Eliminar ${pendingReportsCount} reporte${pendingReportsCount > 1 ? 's' : ''} pendiente${pendingReportsCount > 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) {
      await clearAllPending()
      await refreshPendingCount()
      showToast('Reportes pendientes eliminados')
    }
  }

  // Clases dinámicas basadas en la accesibilidad de botones grandes
  const textTitleClass = largeTouchTargets ? 'text-2xl font-bold' : 'text-xl font-bold'
  const textSubClass = largeTouchTargets ? 'text-base' : 'text-sm'
  const buttonBackClass = largeTouchTargets 
    ? 'min-h-[64px] px-6 text-lg rounded-2xl' 
    : 'min-h-[44px] px-4 text-sm rounded-xl'
  const cardSpacingClass = largeTouchTargets ? 'p-6' : 'p-4'
  const toggleSizeClass = largeTouchTargets ? 'w-16 h-8' : 'w-12 h-6'
  const toggleTranslateClass = largeTouchTargets 
    ? 'translate-x-8' 
    : 'translate-x-6'

  /** Reusable toggle switch component */
  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        checked ? 'bg-blue-600' : 'bg-slate-800'
      } ${toggleSizeClass}`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out absolute top-0.5 ${
          checked ? toggleTranslateClass : 'translate-x-1'
        } ${largeTouchTargets ? 'w-6 h-6 animate-pulse-once' : 'w-4 h-4'}`}
      />
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-12 flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6 pt-2">
        <Button
          variant="outline"
          onClick={() => navigate('/map')}
          className={`flex items-center gap-2 border-slate-800 bg-slate-900/50 text-slate-300 hover:text-white transition-all cursor-pointer ${buttonBackClass}`}
          aria-label="Volver al mapa"
        >
          <ArrowLeft className={largeTouchTargets ? 'w-6 h-6' : 'w-4 h-4'} />
          <span>Volver</span>
        </Button>
        <h1 className={`text-white font-bold leading-tight ${largeTouchTargets ? 'text-3xl' : 'text-2xl'}`}>
          Ajustes
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto space-y-4">
        <section aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className={`text-slate-400 font-semibold mb-3 ${textSubClass} uppercase tracking-wider`}>
            Opciones de Accesibilidad
          </h2>

          <div className="space-y-3">
            {/* Opción 1: Áreas de contacto grandes */}
            <Card className={`border-slate-800 bg-slate-900/40 backdrop-blur transition-all duration-200 ${cardSpacingClass}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className={`text-white font-semibold ${textTitleClass}`}>
                    Botones más grandes
                  </CardTitle>
                  <CardDescription className={`text-slate-400 mt-1 leading-relaxed ${textSubClass}`}>
                    Agranda los botones principales de la app para que sean más fáciles de tocar mientras conduces por zonas con baches.
                  </CardDescription>
                </div>
                <Toggle checked={largeTouchTargets} onChange={() => setLargeTouchTargets(!largeTouchTargets)} label="Activar botones más grandes" />
              </div>
            </Card>

            {/* Opción 2: Alto Contraste */}
            <Card className={`border-slate-800 bg-slate-900/40 backdrop-blur transition-all duration-200 ${cardSpacingClass}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className={`text-white font-semibold ${textTitleClass}`}>
                    Alto Contraste (Sol)
                  </CardTitle>
                  <CardDescription className={`text-slate-400 mt-1 leading-relaxed ${textSubClass}`}>
                    Optimiza la interfaz con colores de alta visibilidad amarillo y negro para combatir el reflejo directo del sol de Chiclayo.
                  </CardDescription>
                </div>
                <Toggle checked={highContrast} onChange={() => setHighContrast(!highContrast)} label="Activar alto contraste" />
              </div>
            </Card>

            {/* Opción 3: Confirmaciones por Voz */}
            <Card className={`border-slate-800 bg-slate-900/40 backdrop-blur transition-all duration-200 ${cardSpacingClass}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className={`text-white font-semibold ${textTitleClass}`}>
                    Confirmaciones por Voz
                  </CardTitle>
                  <CardDescription className={`text-slate-400 mt-1 leading-relaxed ${textSubClass}`}>
                    Escucha una confirmación por audio al reportar para verificar el envío sin desviar la mirada del camino.
                  </CardDescription>
                </div>
                <Toggle checked={voiceConfirmations} onChange={handleVoiceToggle} label="Activar confirmaciones por voz" />
              </div>
            </Card>

            {/* Opción 4: Reporte por Notas de Voz (Próximamente) */}
            <Card className={`border-slate-900 bg-slate-900/20 opacity-60 ${cardSpacingClass}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className={`text-slate-300 font-semibold ${textTitleClass}`}>
                      Notas de Voz rápidas
                    </CardTitle>
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Próximamente
                    </span>
                  </div>
                  <CardDescription className={`text-slate-500 mt-1 leading-relaxed ${textSubClass}`}>
                    Graba la descripción del bache con tu voz en lugar de tener que digitarla.
                  </CardDescription>
                </div>
                <div className={`rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center ${largeTouchTargets ? 'w-12 h-12' : 'w-10 h-10'}`}>
                  <Lock className={`text-slate-600 ${largeTouchTargets ? 'w-6 h-6' : 'w-4 h-4'}`} />
                </div>
              </div>
            </Card>

            {/* Opción 5: Modo sin conexión (Implementada) */}
            <Card className={`border-slate-800 bg-slate-900/40 backdrop-blur transition-all duration-200 ${cardSpacingClass}`}>
              <div className="space-y-4">
                {/* Title and status */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className={`text-white font-semibold ${textTitleClass}`}>
                      Modo sin conexión
                    </CardTitle>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isOnline 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse'}`} />
                      {isOnline ? 'Conectado' : 'Sin conexión'}
                    </span>
                  </div>
                  <CardDescription className={`text-slate-400 mt-1 leading-relaxed ${textSubClass}`}>
                    Guarda reportes localmente cuando no tienes cobertura de internet y los envía al recuperar la señal.
                  </CardDescription>
                </div>

                {/* Pending reports info */}
                {pendingReportsCount > 0 && (
                  <div className={`bg-orange-500/10 border border-orange-500/30 rounded-xl ${largeTouchTargets ? 'p-4' : 'p-3'}`}>
                    <p className={`text-orange-300 font-semibold ${largeTouchTargets ? 'text-lg' : 'text-sm'}`}>
                      📋 {pendingReportsCount} reporte{pendingReportsCount > 1 ? 's' : ''} pendiente{pendingReportsCount > 1 ? 's' : ''}
                    </p>
                    <div className={`flex gap-2 mt-3 ${largeTouchTargets ? 'flex-col' : ''}`}>
                      <Button
                        onClick={handleManualSync}
                        disabled={!isOnline || syncing}
                        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors ${
                          largeTouchTargets ? 'min-h-[56px] text-base rounded-xl' : 'min-h-[40px] text-sm rounded-lg'
                        } ${(!isOnline || syncing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                      </Button>
                      <Button
                        onClick={handleClearPending}
                        variant="ghost"
                        className={`flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-colors cursor-pointer ${
                          largeTouchTargets ? 'min-h-[56px] text-base rounded-xl' : 'min-h-[40px] text-sm rounded-lg'
                        }`}
                      >
                        Limpiar pendientes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sub-toggles for offline behavior */}
                <div className="space-y-3 border-t border-slate-800 pt-3">
                  {/* Store images offline toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className={`text-slate-300 font-medium ${largeTouchTargets ? 'text-base' : 'text-sm'}`}>
                        Guardar imágenes offline
                      </p>
                      <p className={`text-slate-500 mt-0.5 ${largeTouchTargets ? 'text-sm' : 'text-xs'}`}>
                        {offlineStoreImages 
                          ? 'Las fotos se guardan con el reporte (máx. 20 pendientes)' 
                          : 'Solo texto y coordenadas (máx. 100 pendientes)'}
                      </p>
                    </div>
                    <Toggle checked={offlineStoreImages} onChange={() => setOfflineStoreImages(!offlineStoreImages)} label="Guardar imágenes sin conexión" />
                  </div>

                  {/* Auto-sync toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className={`text-slate-300 font-medium ${largeTouchTargets ? 'text-base' : 'text-sm'}`}>
                        Sincronización automática
                      </p>
                      <p className={`text-slate-500 mt-0.5 ${largeTouchTargets ? 'text-sm' : 'text-xs'}`}>
                        {autoSync 
                          ? 'Envía reportes pendientes al recuperar señal' 
                          : 'Deberás sincronizar manualmente'}
                      </p>
                    </div>
                    <Toggle checked={autoSync} onChange={() => setAutoSync(!autoSync)} label="Activar sincronización automática" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer / Logout */}
      <footer className="mt-8 max-w-md w-full mx-auto">
        <Button
          onClick={handleLogout}
          className={`w-full bg-slate-900 hover:bg-slate-800 text-red-500 hover:text-red-400 border border-slate-800 transition-colors font-medium cursor-pointer ${
            largeTouchTargets ? 'min-h-[64px] text-lg rounded-2xl' : 'min-h-[48px] text-base rounded-xl'
          }`}
        >
          Cerrar Sesión
        </Button>
      </footer>
    </div>
  )
}
