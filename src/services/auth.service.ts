import { supabase } from '@/lib/supabaseClient'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export class AuthService {
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
  }

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

export const authService = new AuthService()
