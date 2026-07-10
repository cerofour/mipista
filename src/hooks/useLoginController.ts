import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { authService } from '@/services/auth.service'

export function useLoginController() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const navigate = useNavigate()

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: authError } = isLogin
        ? await authService.signIn(email, password)
        : await authService.signUp(email, password)

      if (authError) {
        setError(authError.message)
      } else if (!isLogin) {
        setSuccess('Cuenta creada. Revisa tu email o inicia sesión directamente.')
      } else {
        navigate('/map')
      }
    } catch (err: any) {
      setError(err?.message || 'Ha ocurrido un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    success,
    toggleMode,
    handleSubmit,
    goBack: () => navigate(-1)
  }
}
