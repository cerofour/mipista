import type { Point } from '@/types'
import { reverseGeocode } from '@/lib/geocoding'

export class LocationService {
  readonly CHICLAYO: Point = { lat: -6.7714, lng: -79.8409 }
  private readonly CACHE_KEY = 'mipista_lastloc'

  getCachedLocation(): Point | null {
    const cached = localStorage.getItem(this.CACHE_KEY)
    if (!cached) return null
    try {
      return JSON.parse(cached) as Point
    } catch {
      return null
    }
  }

  setCachedLocation(point: Point): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(point))
  }

  watchPosition(
    onSuccess: (point: Point) => void,
    onError: () => void,
    options: PositionOptions = { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 }
  ): () => void {
    if (!navigator.geolocation) {
      onError()
      return () => {}
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        onSuccess({ lat: coords.latitude, lng: coords.longitude })
      },
      onError,
      options
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }

  async getAddress(point: Point, signal?: AbortSignal): Promise<string | null> {
    return await reverseGeocode(point.lat, point.lng, signal)
  }
}

export const locationService = new LocationService()
export default locationService;
