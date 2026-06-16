import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AppContext = createContext(null)

const CHICLAYO = { lat: -6.7714, lng: -79.8409 }

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [reports, setReports]         = useState([])
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [toast, setToast]             = useState(null)

  // ── Auth listener ──────────────────────────────────────────────
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

  // ── Reportes ────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from('reportes_baches')
      .select('id, lat, lng, prioridad, descripcion, imagen_url, created_at')
      .order('created_at', { ascending: false })
    if (!error) setReports(data ?? [])
  }, [])

  // ── Toast ────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const value = {
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

export const useApp = () => useContext(AppContext)