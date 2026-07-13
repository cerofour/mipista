import { supabase } from '@/lib/supabaseClient'
import type { Report, Priority, Point } from '@/types'
import { authService } from './auth.service'
import { savePendingReport } from '@/lib/offlineStore'

export interface ReportSubmitData {
  point: Point | null
  prioridad: Priority
  descripcion: string | null
  file: File | null
}

/** Result type for sendReportWithFallback */
export type ReportResult =
  | { status: 'sent' }
  | { status: 'queued' }
  | { status: 'queue_full'; reason: string }
  | { status: 'error'; error: Error }

export class ReportService {
  async fetchReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reportes_baches')
      .select('id, lat, lng, prioridad, descripcion, imagen_url, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }
    return (data as Report[]) ?? []
  }

  async uploadImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('bache-images')
      .upload(path, file, { contentType: file.type })

    if (uploadErr) {
      throw uploadErr
    }

    const { data } = supabase.storage.from('bache-images').getPublicUrl(path)
    return data.publicUrl
  }

  async sendReport({ point, prioridad, descripcion, file }: ReportSubmitData) {
    if (!point) return new Error('Coordinates are required')

    let imagen_url: string | null = null
    if (file) {
      try {
        imagen_url = await this.uploadImage(file)
      } catch (err: any) {
        return err
      }
    }

    const user = await authService.getCurrentUser()
    if (!user) return new Error('User must be logged in')

    const { error } = await supabase.from('reportes_baches').insert({
      user_id: user.id,
      lat: point.lat,
      lng: point.lng,
      prioridad,
      descripcion,
      imagen_url
    })

    return error
  }

  /**
   * Try to send a report online. If offline or the network fails,
   * fall back to saving in IndexedDB for later sync.
   */
  async sendReportWithFallback(
    { point, prioridad, descripcion, file }: ReportSubmitData,
    offlineStoreImages: boolean
  ): Promise<ReportResult> {
    if (!point) return { status: 'error', error: new Error('Coordinates are required') }

    // If online, attempt normal send
    if (navigator.onLine) {
      try {
        const err = await this.sendReport({ point, prioridad, descripcion, file })
        if (!err) {
          return { status: 'sent' }
        }

        // Check if it's a network-level error (fetch failure)
        if (err instanceof TypeError || (err as any)?.message?.includes('fetch')) {
          // Fall through to offline save
        } else {
          return { status: 'error', error: err instanceof Error ? err : new Error(String(err)) }
        }
      } catch (e: any) {
        // Network-level exception — fall through to offline save
        if (!(e instanceof TypeError)) {
          return { status: 'error', error: e instanceof Error ? e : new Error(String(e)) }
        }
      }
    }

    // Offline or network failure: save to IndexedDB
    let imageBlob: Blob | null = null
    if (file && offlineStoreImages) {
      imageBlob = file as Blob
    }

    const result = await savePendingReport(
      {
        lat: point.lat,
        lng: point.lng,
        prioridad,
        descripcion,
        imageBlob
      },
      offlineStoreImages
    )

    if (result.saved) {
      return { status: 'queued' }
    } else {
      return { status: 'queue_full', reason: result.reason ?? 'Cola llena' }
    }
  }
}

export const reportService = new ReportService()
export default reportService;

