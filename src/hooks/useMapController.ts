import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { reportService } from '@/services/report.service'
import type { ReportResult } from '@/services/report.service'
import { locationService } from '@/services/location.service'
import { authService } from '@/services/auth.service'
import { useReverseGeocode } from '@/lib/useReverseGeoCode'
import type { Point } from '@/types'
import { speak } from '@/lib/speech'

export function useMapController() {
  const {
    userLocation, setUserLocation,
    fetchReports, reports,
    selectedPoint, setSelectedPoint,
    showReportModal, setShowReportModal,
    toast, showToast,
    CHICLAYO,
    voiceConfirmations,
    offlineStoreImages,
    refreshPendingCount
  } = useApp()

  const [showListModal, setShowListModal] = useState(false)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(userLocation)
  const [quickStep, setQuickStep] = useState(0)
  const [changeToSelectedPos, setChangeToSelectedPos] = useState<boolean>(false)
  const quickTimer = useRef<ReturnType<typeof setTimeout> | any>(null)

  const { address: selectedAddress, loading: selectedLoading } = useReverseGeocode(selectedPoint)
  const { address: currentAddress, loading: currentLoading } = useReverseGeocode(userLocation)

  // Sync currentPoint when userLocation updates
  useEffect(() => {
    setCurrentPoint(userLocation)
  }, [userLocation])

  useEffect(() => {
    fetchReports()

    const cached = locationService.getCachedLocation()
    if (cached) {
      setUserLocation(cached)
    }

    const unsubscribe = locationService.watchPosition(
      (loc: Point) => {
        setUserLocation(loc)
        locationService.setCachedLocation(loc)
      },
      () => {
        if (!cached) {
          setUserLocation(CHICLAYO)
        }
      }
    )

    return () => {
      unsubscribe()
      if (quickTimer.current) {
        clearTimeout(quickTimer.current)
      }
    }
  }, []) // eslint-disable-line

  const handleMapClick = (point: Point) => {
    setChangeToSelectedPos(true)
    setSelectedPoint(point)
    setQuickStep(0)
    if (quickTimer.current) clearTimeout(quickTimer.current)
  }

  /** Handle the result of a report submission (online or offline fallback) */
  const handleReportResult = (result: ReportResult) => {
    switch (result.status) {
      case 'sent':
        showToast('Reporte enviado correctamente')
        fetchReports()
        break
      case 'queued':
        showToast('Sin conexión. Reporte guardado, se enviará al recuperar señal')
        refreshPendingCount()
        break
      case 'queue_full':
        showToast(result.reason, 'error')
        break
      case 'error':
        showToast('Error al enviar reporte', 'error')
        break
    }
  }

  const handleQuickReport = async () => {
    if (quickStep === 0) {
      setQuickStep(1)
      if (voiceConfirmations) {
        speak('Toca de nuevo para confirmar reporte rápido')
      }
      quickTimer.current = setTimeout(() => setQuickStep(0), 4000)
    } else {
      if (quickTimer.current) clearTimeout(quickTimer.current)

      const result = await reportService.sendReportWithFallback(
        {
          point: currentPoint,
          prioridad: 'medio',
          descripcion: null,
          file: null
        },
        offlineStoreImages
      )

      handleReportResult(result)
      dismissPanel()
    }
  }

  const dismissPanel = () => {
    setChangeToSelectedPos(false)
    setSelectedPoint(null)
    setQuickStep(0)
    if (quickTimer.current) clearTimeout(quickTimer.current)
  }

  const handleSignOut = async () => {
    await authService.logout()
  }

  const centerOnGPS = () => {
    if (userLocation) {
      setUserLocation({ ...userLocation })
    }
  }

  const locationLabel = userLocation
    ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
    : 'Localizando...'

  const displayAddress = () => {
    if (changeToSelectedPos) {
      if (selectedLoading) return 'Localizando...'
      return selectedAddress || 'Ubicación sin nombre'
    }
    if (currentLoading) return 'Localizando...'
    return currentAddress || 'Ubicación sin nombre'
  }

  const handleReportSubmit = async (data: any) => {
    const result = await reportService.sendReportWithFallback(data, offlineStoreImages)
    console.log(result)
    handleReportResult(result)
    setShowReportModal(false)
    dismissPanel()
  }

  return {
    userLocation,
    setUserLocation,
    reports,
    selectedPoint,
    showReportModal,
    setShowReportModal,
    toast,
    showListModal,
    setShowListModal,
    quickStep,
    locationLabel,
    displayAddress,
    handleMapClick,
    handleQuickReport,
    dismissPanel,
    handleSignOut,
    centerOnGPS,
    handleReportSubmit
  }
}

