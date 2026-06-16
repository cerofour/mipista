export type Priority = 'bajo' | 'medio' | 'alto'

export interface Point {
  lat: number
  lng: number
}

export interface Report {
  id: string
  lat: number
  lng: number
  prioridad: Priority
  descripcion: string | null
  imagen_url: string | null
  created_at: string
}

export interface ToastState {
  message: string
  type: 'success' | 'error'
}