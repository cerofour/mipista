import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router';

export default function MiPistaLogin() {
  // Estados integrados de Supabase
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  }

  const navigateMap = () => {
    navigate("/map");
  }

  // Lógica de envío
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: authError } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
    } else if (!isLogin) {
      setSuccess('Cuenta creada. Revisa tu email o inicia sesión directamente.');
    } else {
        navigateMap();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#323232] text-white flex flex-col items-center justify-center p-4 relative font-sans">
      
      {/* Botón de Regresar */}
      <Button variant="ghost" className="absolute top-6 left-6 flex items-center text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
        onClick={() => navigateBack()}>
        <ArrowLeft className="w-5 h-5 mr-2" />
        Regresar al Inicio
      </Button >

      {/* Encabezado dinámico */}
      <div className="mb-8 flex flex-col items-center">
        {/* Contenedor del Logo (Placeholder) */}
        <div className="bg-[#1C1C1E] px-6 py-2 rounded-full flex items-center gap-2 mb-8 shadow-md">
          <div className="relative inline-block">
              <img src="Logo1.png"></img>
          </div>
        </div>

        <h1 className="text-[28px] font-bold mb-4">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>
        <p className="text-center text-gray-300 text-sm max-w-[290px] leading-relaxed">
          {isLogin 
            ? 'Inicia sesión para reportar incidentes y mantener la ruta segura'
            : 'Regístrate para comenzar a reportar incidentes en la vía'}
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="w-full max-w-[380px] bg-[#424242] rounded-[1.5rem] p-6 shadow-2xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Campo Correo Electrónico */}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-gray-200 text-sm font-normal">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 bg-[#525252] border-none text-white placeholder:text-gray-400 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-[#0088FF] focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-gray-200 text-sm font-normal">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type="password"
                placeholder="............"
                value={password}
                autoComplete={isLogin ? "current-password" : "new-password"}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 bg-[#525252] border-none text-white placeholder:text-gray-400 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-[#0088FF] focus-visible:ring-offset-0 font-bold tracking-widest"
              />
            </div>
          </div>

          {/* Alertas de Error o Éxito */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center">{success}</p>}

          {/* Botón Principal y Enlace */}
          <div className="pt-2 space-y-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0088FF] hover:bg-[#0077E6] text-white h-[50px] rounded-xl text-base font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear Cuenta'}
            </Button>

            {isLogin && (
              <div className="text-center">
                <a href="#" className="text-[#0088FF] text-sm font-medium hover:underline transition-all">
                  ¿Has olvidado tu contraseña?
                </a>
              </div>
            )}
          </div>

        </form>
      </div>

      {/* Enlace para alternar entre Login y Registro */}
      <div className="mt-10 text-sm flex items-center justify-center gap-1">
        <span className="text-gray-300">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        </span>
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
          className="text-[#0088FF] font-medium hover:underline transition-all bg-transparent border-none p-0 cursor-pointer"
        >
          {isLogin ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </div>

      <p className="text-slate-400 text-xs text-center absolute bottom-6">
        Chiclayo, Lambayeque — Perú
      </p>
      
    </div>
  );
}