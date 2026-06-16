import { useEffect, useRef, useState } from 'react'
import { reverseGeocode } from '../lib/geocoding'
import type { Point } from '../types'

// Caché en memoria — redondeamos a 4 decimales (~11m) para no
// disparar una request distinta por cada jitter del GPS
const cache = new Map<string, string | null>()

function keyFor(point: Point): string {
  return `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`
}

export function useReverseGeocode(point: Point | null, debounceMs = 500) {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!point) {
      setAddress(null)
      setLoading(false)
      return
    }

    const key = keyFor(point)
    if (cache.has(key)) {
      setAddress(cache.get(key) ?? null)
      setLoading(false)
      return
    }

    setLoading(true)
    clearTimeout(timerRef.current)
    abortRef.current?.abort()

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      const result = await reverseGeocode(point.lat, point.lng, controller.signal)
      if (controller.signal.aborted) return

      cache.set(key, result)
      setAddress(result)
      setLoading(false)
    }, debounceMs)

    return () => clearTimeout(timerRef.current)
  }, [point?.lat, point?.lng, debounceMs])

  return { address, loading }
}