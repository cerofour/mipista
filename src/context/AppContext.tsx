import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Point, Report, ToastState } from '../types'
import { authService } from '../services/auth.service'
import { reportService } from '../services/report.service'
import { locationService } from '../services/location.service'
import { speak } from '../lib/speech'
import { syncService } from '../services/sync.service'
import { getPendingCount, purgeExpiredReports } from '../lib/offlineStore'

interface AppContextValue {
  user: User | null
  loading: boolean
  userLocation: Point | null
  setUserLocation: (loc: Point) => void
  reports: Report[]
  fetchReports: () => Promise<void>
  selectedPoint: Point | null
  setSelectedPoint: (point: Point | null) => void
  showReportModal: boolean
  setShowReportModal: (show: boolean) => void
  toast: ToastState | null
  showToast: (message: string, type?: 'success' | 'error') => void
  CHICLAYO: Point
  largeTouchTargets: boolean
  setLargeTouchTargets: (enabled: boolean) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
  voiceConfirmations: boolean
  setVoiceConfirmations: (enabled: boolean) => void
  // Offline mode
  isOnline: boolean
  pendingReportsCount: number
  refreshPendingCount: () => Promise<void>
  offlineStoreImages: boolean
  setOfflineStoreImages: (enabled: boolean) => void
  autoSync: boolean
  setAutoSync: (enabled: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<Point | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [largeTouchTargets, setLargeTouchTargetsState] = useState<boolean>(() => {
    return localStorage.getItem('mipista_large_touch_targets') === 'true'
  })
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('mipista_high_contrast') === 'true'
  })
  const [voiceConfirmations, setVoiceConfirmationsState] = useState<boolean>(() => {
    return localStorage.getItem('mipista_voice_confirmations') === 'true'
  })

  // Offline mode states
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0)
  const [offlineStoreImages, setOfflineStoreImagesState] = useState<boolean>(() => {
    return localStorage.getItem('mipista_offline_store_images') !== 'false' // default true
  })
  const [autoSync, setAutoSyncState] = useState<boolean>(() => {
    return localStorage.getItem('mipista_auto_sync') !== 'false' // default true
  })

  useEffect(() => {
    authService.getSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const subscription = authService.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  // Sync high-contrast class with document.documentElement
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [highContrast])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize pending count and purge expired reports on mount
  useEffect(() => {
    const init = async () => {
      await purgeExpiredReports(7)
      const count = await getPendingCount()
      setPendingReportsCount(count)
    }
    init()
  }, [])

  // Auto-sync listener: mount when autoSync is true, tear down when false
  useEffect(() => {
    if (!autoSync) {
      syncService.stopOnlineListener()
      return
    }

    syncService.startOnlineListener(async (remaining, synced) => {
      setPendingReportsCount(remaining)
      if (synced > 0) {
        const msg = synced === 1
          ? '1 reporte pendiente sincronizado'
          : `${synced} reportes pendientes sincronizados`
        showToastFn(msg)
        // Refresh the reports list after syncing
        try {
          const data = await reportService.fetchReports()
          setReports(data)
        } catch {
          // Ignore fetch errors here
        }
      }
    })

    return () => syncService.stopOnlineListener()
  }, [autoSync]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReports = useCallback(async () => {
    try {
      const data = await reportService.fetchReports()
      setReports(data)
    } catch {
      // Ignorar errores o manejar según diseño original
    }
  }, [])

  const showToastFn = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    // Voice confirmations are read from localStorage directly to avoid stale closure
    const voiceEnabled = localStorage.getItem('mipista_voice_confirmations') === 'true'
    if (voiceEnabled) {
      speak(message)
    }
    setTimeout(() => setToast(null), 3000)
  }, [])

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount()
    setPendingReportsCount(count)
  }, [])

  const setLargeTouchTargets = useCallback((enabled: boolean) => {
    setLargeTouchTargetsState(enabled)
    localStorage.setItem('mipista_large_touch_targets', String(enabled))
  }, [])

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled)
    localStorage.setItem('mipista_high_contrast', String(enabled))
  }, [])

  const setVoiceConfirmations = useCallback((enabled: boolean) => {
    setVoiceConfirmationsState(enabled)
    localStorage.setItem('mipista_voice_confirmations', String(enabled))
  }, [])

  const setOfflineStoreImages = useCallback((enabled: boolean) => {
    setOfflineStoreImagesState(enabled)
    localStorage.setItem('mipista_offline_store_images', String(enabled))
  }, [])

  const setAutoSync = useCallback((enabled: boolean) => {
    setAutoSyncState(enabled)
    localStorage.setItem('mipista_auto_sync', String(enabled))
  }, [])

  const value: AppContextValue = {
    user, loading,
    userLocation, setUserLocation,
    reports, fetchReports,
    selectedPoint, setSelectedPoint,
    showReportModal, setShowReportModal,
    toast, showToast: showToastFn,
    CHICLAYO: locationService.CHICLAYO,
    largeTouchTargets,
    setLargeTouchTargets,
    highContrast,
    setHighContrast,
    voiceConfirmations,
    setVoiceConfirmations,
    isOnline,
    pendingReportsCount,
    refreshPendingCount,
    offlineStoreImages,
    setOfflineStoreImages,
    autoSync,
    setAutoSync
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}