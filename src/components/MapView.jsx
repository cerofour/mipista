import { useEffect } from 'react'
import {
  MapContainer, TileLayer, Marker, Popup,
  useMapEvents, useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../context/AppContext'

// ── Fix del bug clásico de iconos con Vite ──────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Íconos de triángulo por prioridad (como en el prototipo) ─────
const PRIORITY_COLORS = { bajo: '#EAB308', medio: '#F97316', alto: '#EF4444' }

const triangleIcon = (prioridad) => {
  const color = PRIORITY_COLORS[prioridad] ?? PRIORITY_COLORS.medio
  return L.divIcon({
    html: `
      <div style="
        width: 0; height: 0;
        border-left: 13px solid transparent;
        border-right: 13px solid transparent;
        border-bottom: 22px solid ${color};
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));
      "></div>`,
    className: '',
    iconSize: [26, 22],
    iconAnchor: [13, 22]
  })
}

// Ícono del usuario (punto azul pulsante)
const userIcon = L.divIcon({
  html: `
    <div style="position:relative;width:20px;height:20px">
      <div style="
        position:absolute;inset:0;
        background:rgba(59,130,246,0.25);
        border-radius:50%;
        animation:pulse 2s infinite;
      "></div>
      <div style="
        position:absolute;top:3px;left:3px;
        width:14px;height:14px;
        background:#3B82F6;
        border:2.5px solid white;
        border-radius:50%;
        box-shadow:0 0 6px rgba(59,130,246,0.6);
      "></div>
    </div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

// ── Subcomponente: captura clicks en el mapa ─────────────────────
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

// ── Subcomponente: re-centra el mapa cuando cambia la ubicación ──
function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom(), { animate: true })
  }, [center?.lat, center?.lng]) // eslint-disable-line
  return null
}

// ── Componente principal del mapa ────────────────────────────────
export default function MapView({ onMapClick }) {
  const { userLocation, reports, CHICLAYO } = useApp()
  const center = userLocation ?? CHICLAYO

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      zoomControl={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onMapClick={onMapClick} />

      {userLocation && <RecenterMap center={userLocation} />}

      {/* Marcador de posición del usuario */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
      )}

      {/* Marcadores de reportes existentes */}
      {reports.map(r => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={triangleIcon(r.prioridad)}
        >
          <Popup className="text-sm">
            <strong className="capitalize">{r.prioridad}</strong>
            {r.descripcion && <p className="mt-1 text-gray-600">{r.descripcion}</p>}
            {r.imagen_url && (
              <img
                src={r.imagen_url}
                alt="bache"
                className="mt-2 rounded w-36 object-cover"
              />
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}