import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

/** Shape of a report stored offline in IndexedDB */
export interface PendingReport {
  id: string
  lat: number
  lng: number
  prioridad: 'bajo' | 'medio' | 'alto'
  descripcion: string | null
  imageBlob: Blob | null
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'failed'
  retryCount: number
}

interface MiPistaDB extends DBSchema {
  'pending-reports': {
    key: string
    value: PendingReport
    indexes: {
      'by-created': string
    }
  }
}

const DB_NAME = 'mipista-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-reports' as const

let dbPromise: Promise<IDBPDatabase<MiPistaDB>> | null = null

function getDB(): Promise<IDBPDatabase<MiPistaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MiPistaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by-created', 'createdAt')
        }
      }
    })
  }
  return dbPromise
}

/**
 * Maximum number of pending reports allowed.
 * With images: ~20 (60 MB worst case)
 * Without images: ~100 (text-only, a few KB each)
 */
export function getMaxPending(storeImages: boolean): number {
  return storeImages ? 20 : 100
}

/** Save a report to the offline queue */
export async function savePendingReport(
  data: {
    lat: number
    lng: number
    prioridad: 'bajo' | 'medio' | 'alto'
    descripcion: string | null
    imageBlob: Blob | null
  },
  storeImages: boolean
): Promise<{ saved: boolean; reason?: string }> {
  const db = await getDB()
  const count = await db.count(STORE_NAME)
  const max = getMaxPending(storeImages)

  if (count >= max) {
    return {
      saved: false,
      reason: `Límite de ${max} reportes pendientes alcanzado. Conéctate a internet para sincronizar.`
    }
  }

  const report: PendingReport = {
    id: crypto.randomUUID(),
    lat: data.lat,
    lng: data.lng,
    prioridad: data.prioridad,
    descripcion: data.descripcion,
    imageBlob: storeImages ? data.imageBlob : null,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending',
    retryCount: 0
  }

  await db.put(STORE_NAME, report)
  return { saved: true }
}

/** Get all pending reports ordered by creation time (oldest first / FIFO) */
export async function getPendingReports(): Promise<PendingReport[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'by-created')
}

/** Get the count of pending reports */
export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}

/** Delete a report after successful sync */
export async function deletePendingReport(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/** Update the sync status and optionally the retry count */
export async function updateSyncStatus(
  id: string,
  status: 'pending' | 'syncing' | 'failed',
  retryCount?: number
): Promise<void> {
  const db = await getDB()
  const report = await db.get(STORE_NAME, id)
  if (report) {
    report.syncStatus = status
    if (retryCount !== undefined) {
      report.retryCount = retryCount
    }
    await db.put(STORE_NAME, report)
  }
}

/** Delete all pending reports (user-initiated cleanup) */
export async function clearAllPending(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/**
 * Purge reports older than `maxAgeDays`.
 * Returns the number of purged reports.
 */
export async function purgeExpiredReports(maxAgeDays: number = 7): Promise<number> {
  const db = await getDB()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxAgeDays)
  const cutoffISO = cutoff.toISOString()

  const all = await db.getAllFromIndex(STORE_NAME, 'by-created')
  let purged = 0
  for (const report of all) {
    if (report.createdAt < cutoffISO) {
      await db.delete(STORE_NAME, report.id)
      purged++
    }
  }
  return purged
}
