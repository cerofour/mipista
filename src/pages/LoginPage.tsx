import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useLoginController } from '../hooks/useLoginController';
import { useLandscape } from '../hooks/useLandscape';
import { cn } from "@/lib/utils";

export default function MiPistaLogin() {
  const isLandscape = useLandscape();
  const {
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
    goBack
  } = useLoginController();

  return (
    <div className={cn(
      "min-h-screen bg-[#323232] text-white flex flex-col items-center justify-center p-4 relative font-sans",
      isLandscape && "py-8 justify-center"
    )}>

      <Button
        variant="ghost"
        className={cn(
          "absolute flex items-center text-sm text-gray-300 hover:text-black transition-colors cursor-pointer min-h-[44px]",
          isLandscape ? "top-3 left-4 text-xs" : "top-6 left-6"
        )}
        onClick={goBack}
      >
        <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
        Regresar al Inicio
      </Button>

      <main 
        id="main-content" 
        className={cn(
          "w-full flex", 
          isLandscape ? "flex-row justify-center items-center max-w-4xl gap-8 px-4" : "flex-col items-center"
        )}
      >

        {/* Left Column: branding & info */}
        <div className={cn(
          "flex flex-col items-center", 
          isLandscape ? "items-start text-left max-w-[280px] mb-0" : "mb-8"
        )}>
          <div className={cn(
            "bg-[#1C1C1E] px-6 py-2 rounded-full flex items-center gap-2 shadow-md", 
            isLandscape ? "mb-4" : "mb-8"
          )}>
            <img src="Logo1.png" alt="Logo Mi Pista" />
          </div>

          <h1 className={cn(
            "font-bold mb-4", 
            isLandscape ? "text-xl mb-2 text-left" : "text-[28px]"
          )}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className={cn(
            "text-center text-gray-300 text-sm max-w-[290px] leading-relaxed", 
            isLandscape ? "text-left text-xs" : ""
          )}>
            {isLogin
              ? 'Inicia sesión para reportar incidentes y mantener la ruta segura'
              : 'Regístrate para comenzar a reportar incidentes en la vía'}
          </p>

          {isLandscape && (
            <p className="text-slate-500 text-xs mt-6">
              Chiclayo, Lambayeque — Perú
            </p>
          )}
        </div>

        {/* Right Column: the form container & switch toggle */}
        <div className={cn(
          "w-full flex flex-col items-center", 
          isLandscape ? "max-w-[340px]" : "max-w-[380px]"
        )}>
          <section
            aria-label={isLogin ? 'Formulario de inicio de sesión' : 'Formulario de registro'}
            className={cn(
              "w-full bg-[#424242] rounded-[1.5rem] shadow-2xl p-6",
              isLandscape ? "p-4 rounded-xl" : "p-6"
            )}
          >
            <form className={cn("space-y-6", isLandscape && "space-y-3")} onSubmit={handleSubmit} noValidate>

              <div className={cn("space-y-2.5", isLandscape && "space-y-1")}>
                <Label htmlFor="email" className="text-gray-200 text-sm font-normal">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'form-error' : undefined}
                    className={cn(
                      "pl-11 bg-[#525252] border-none text-white placeholder:text-gray-400 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-[#0088FF] focus-visible:ring-offset-0",
                      isLandscape && "h-10 rounded-lg text-xs"
                    )}
                  />
                </div>
              </div>

              <div className={cn("space-y-2.5", isLandscape && "space-y-1")}>
                <Label htmlFor="password" className="text-gray-200 text-sm font-normal">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'form-error' : undefined}
                    className={cn(
                      "pl-11 bg-[#525252] border-none text-white placeholder:text-gray-400 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-[#0088FF] focus-visible:ring-offset-0 font-bold tracking-widest",
                      isLandscape && "h-10 rounded-lg text-xs font-normal tracking-normal"
                    )}
                  />
                </div>
              </div>

              {error && (
                <p id="form-error" role="alert" className="text-red-400 text-sm text-center">
                  ⚠ {error}
                </p>
              )}
              {success && (
                <p role="status" className="text-green-400 text-sm text-center">
                  ✓ {success}
                </p>
              )}

              <div className={cn("pt-2 space-y-4", isLandscape && "pt-1 space-y-2")}>

                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full bg-[#0088FF] hover:bg-[#0077E6] text-white h-[50px] rounded-xl text-base font-medium transition-colors disabled:opacity-50",
                    isLandscape && "h-10 rounded-lg text-sm"
                  )}
                >
                  {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear Cuenta'}
                </Button>

                {isLogin && (
                  <div className="text-center">
                    <a
                      href="#"
                      className={cn(
                        "text-[#0088FF] text-sm font-medium hover:underline transition-all inline-block min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088FF] rounded",
                        isLandscape && "text-xs min-h-[30px]"
                      )}
                    >
                      ¿Has olvidado tu contraseña?
                    </a>
                  </div>
                )}
              </div>

            </form>
          </section>

          <div className={cn(
            "text-sm flex items-center justify-center gap-1", 
            isLandscape ? "mt-3" : "mt-10"
          )}>
            <span className="text-gray-300">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#0088FF] font-medium hover:underline transition-all bg-transparent
                         border-none cursor-pointer min-h-[44px] px-2
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-[#0088FF] rounded"
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </div>
        </div>

      </main>

      {!isLandscape && (
        <p className="text-slate-400 text-sm text-center mt-8">
          Chiclayo, Lambayeque — Perú
        </p>
      )}
    </div>
  );
}