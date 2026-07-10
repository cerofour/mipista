import { supabase } from '@/lib/supabaseClient'
import type { Report, Priority, Point } from '@/types'
import { authService } from './auth.service'

export interface ReportSubmitData {
  point: Point | null
  prioridad: Priority
  descripcion: string | null
  file: File | null
}

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
}

export const reportService = new ReportService()
export default reportService;
