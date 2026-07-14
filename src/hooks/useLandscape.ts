import { useEffect, useState } from 'react'

/**
 * Detects landscape orientation on mobile/tablet devices.
 * Returns true when the viewport is wider than tall AND short enough
 * to be a phone/tablet in landscape (max-height 500px).
 */
export function useLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches
  })

  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape) and (max-height: 500px)')

    const handleChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches)
    }

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isLandscape
}
