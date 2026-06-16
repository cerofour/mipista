import { useApp } from './context/AppContext'
import InitialPage from './pages/InitialPage'
import MapPage from './pages/MapPage'

export default function App() {
  const { user, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🛣️</div>
          <p className="text-slate-400 text-sm">Cargando Mi Pista...</p>
        </div>
      </div>
    )
  }

  return user ? <MapPage /> : <InitialPage/>
}