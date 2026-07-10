import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Point, Report, ToastState } from '../types'
import { authService } from '../services/auth.service'
import { reportService } from '../services/report.service'
import { locationService } from '../services/location.service'

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

  const fetchReports = useCallback(async () => {
    try {
      const data = await reportService.fetchReports()
      setReports(data)
    } catch {
      // Ignorar errores o manejar según diseño original
    }
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const setLargeTouchTargets = useCallback((enabled: boolean) => {
    setLargeTouchTargetsState(enabled)
    localStorage.setItem('mipista_large_touch_targets', String(enabled))
  }, [])

  const value: AppContextValue = {
    user, loading,
    userLocation, setUserLocation,
    reports, fetchReports,
    selectedPoint, setSelectedPoint,
    showReportModal, setShowReportModal,
    toast, showToast,
    CHICLAYO: locationService.CHICLAYO,
    largeTouchTargets,
    setLargeTouchTargets
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}