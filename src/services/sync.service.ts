import { reportService } from './report.service'
import {
  getPendingReports,
  deletePendingReport,
  updateSyncStatus,
  getPendingCount,
  purgeExpiredReports
} from '@/lib/offlineStore'
import { authService } from './auth.service'

const MAX_RETRIES = 5
const RECONNECT_DEBOUNCE_MS = 2000

type SyncCallback = (pendingCount: number, syncedCount: number) => void

export class SyncService {
  private onlineHandler: (() => void) | null = null
  private callback: SyncCallback | null = null
  private isSyncing = false

  /**
   * Attempt to sync all pending reports to Supabase.
   * Returns the number of successfully synced reports.
   */
  async syncPendingReports(): Promise<number> {
    if (this.isSyncing) return 0
    this.isSyncing = true

    let syncedCount = 0

    try {
      const user = await authService.getCurrentUser()
      if (!user) {
        return 0
      }

      const pending = await getPendingReports()

      for (const report of pending) {
        if (!navigator.onLine) break

        await updateSyncStatus(report.id, 'syncing')

        // Convert Blob back to File for upload if present
        let file: File | null = null
        if (report.imageBlob) {
          file = new File([report.imageBlob], `offline-${report.id}.jpg`, {
            type: report.imageBlob.type || 'image/jpeg'
          })
        }

        const error = await reportService.sendReport({
          point: { lat: report.lat, lng: report.lng },
          prioridad: report.prioridad,
          descripcion: report.descripcion,
          file
        })

        if (!error) {
          await deletePendingReport(report.id)
          syncedCount++
        } else {
          const newRetry = report.retryCount + 1
          const newStatus = newRetry >= MAX_RETRIES ? 'failed' : 'pending'
          await updateSyncStatus(report.id, newStatus, newRetry)
        }
      }
    } finally {
      this.isSyncing = false
    }

    // Notify listener of updated counts
    if (this.callback) {
      const remaining = await getPendingCount()
      this.callback(remaining, syncedCount)
    }

    return syncedCount
  }

  /**
   * Start listening for `online` events to auto-sync.
   * The callback is invoked after each sync attempt with (pendingCount, syncedCount).
   */
  startOnlineListener(callback: SyncCallback): void {
    this.callback = callback
    this.stopOnlineListener() // Clean any previous listener

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    this.onlineHandler = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        this.syncPendingReports()
      }, RECONNECT_DEBOUNCE_MS)
    }

    window.addEventListener('online', this.onlineHandler)
  }

  /** Stop listening for reconnection events */
  stopOnlineListener(): void {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler)
      this.onlineHandler = null
    }
  }

  /** Purge reports older than maxAgeDays and return purged count */
  async purgeExpired(maxAgeDays: number = 7): Promise<number> {
    return purgeExpiredReports(maxAgeDays)
  }
}

export const syncService = new SyncService()
export default syncService
