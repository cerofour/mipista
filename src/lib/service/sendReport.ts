import { supabase } from "../supabaseClient"

import { Priority, Point } from "@/types"

export interface ReportSubmitData {
  point: Point | null
  prioridad: Priority
  descripcion: string | null
  file: File | null
}

const sendReport = async ({ point, prioridad, descripcion, file }: ReportSubmitData) => {
    if (!point) return

    let imagen_url: string | null = null

    if (file) {
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
            .from('bache-images')
            .upload(path, file, { contentType: file.type })

        if (!uploadErr) {
            const { data } = supabase.storage.from('bache-images').getPublicUrl(path)
            imagen_url = data.publicUrl
        }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('reportes_baches').insert({
        user_id: user.id,
        lat: point.lat,
        lng: point.lng,
        prioridad,
        descripcion,
        imagen_url
    })

    return error;
}

export default sendReport;