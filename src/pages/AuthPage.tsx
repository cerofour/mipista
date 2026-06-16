import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthPage() {
  const [isLogin, setIsLogin]   = useState(true)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (!isLogin) {
      setSuccess('Cuenta creada. Revisa tu email o inicia sesión directamente.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header con identidad visual */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="mb-8 text-center">
          {/* Logo — icono de carretera con triángulo de advertencia */}
          <div className="relative inline-block mb-4">
              <img src="Logo1.png"></img>
            <span className="absolute -top-1 -right-1 text-xl">⚠️</span>
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Mi Pista</h1>
          <p className="text-slate-400 text-sm mt-1">
            Reporta baches en Chiclayo
          </p>
        </div>

        {/* Formulario */}
        <div className="w-full max-w-sm space-y-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            autoComplete="email"
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-2xl px-4 py-4 text-sm 
                       outline-none placeholder-slate-500 border border-slate-700 
                       focus:border-blue-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-slate-800 text-white rounded-2xl px-4 py-4 text-sm 
                       outline-none placeholder-slate-500 border border-slate-700 
                       focus:border-blue-500 transition-colors"
          />

          {error   && <p className="text-red-400 text-xs px-1">{error}</p>}
          {success && <p className="text-green-400 text-xs px-1">{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
                       text-white rounded-2xl py-4 font-semibold text-sm 
                       transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Cargando...'
              : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>

          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null) }}
            className="w-full text-slate-400 text-sm py-2"
          >
            {isLogin
              ? '¿No tienes cuenta? Regístrate gratis'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>

      <p className="text-slate-600 text-xs text-center pb-6">
        Chiclayo, Lambayeque — Perú
      </p>
    </div>
  )

}