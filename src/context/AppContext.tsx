import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import type { Point, Report, ToastState } from '../types'

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
}

const AppContext = createContext<AppContextValue | null>(null)

const CHICLAYO: Point = { lat: -6.7714, lng: -79.8409 }

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<Point | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from('reportes_baches')
      .select('id, lat, lng, prioridad, descripcion, imagen_url, created_at')
      .order('created_at', { ascending: false })
    if (!error) setReports((data as Report[]) ?? [])
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const value: AppContextValue = {
    user, loading,
    userLocation, setUserLocation,
    reports, fetchReports,
    selectedPoint, setSelectedPoint,
    showReportModal, setShowReportModal,
    toast, showToast,
    CHICLAYO
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}