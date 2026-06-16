import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function InitialPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center justify-center p-4 relative font-sans">

      <main id="main-content" className="mb-8 flex flex-col items-center justify-between">

        <div className="px-6 py-2 rounded-full flex items-center gap-2">
          <div className="relative inline-block">
            <img src="Logo1.png" alt="Logo Mi Pista" />
          </div>
        </div>

        <div className="max-w-xs text-center my-8">
          <h1 className="text-xl font-bold">Bienvenido a Mi Pista</h1>
          <p>Reporta y visualiza baches en tiempo real para una conducción más segura</p>
        </div>

        <div className="px-6 py-2 rounded-full flex flex-col items-center gap-4 mb-8 w-full">
          <Button
            variant="default"
            className="h-[50px] w-full rounded-xl font-medium"
            size="lg"
            onClick={() => navigate('/login')}
          >
            Ingresar
          </Button>
        </div>

      </main>
    </div>
  );
}