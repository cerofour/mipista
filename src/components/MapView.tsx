import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../context/AppContext'
import type { Point, Priority, Report } from '../types'

import lowPriorityIcon from '../assets/PBaja.svg'
import midPriorityIcon from '../assets/PMedia.svg'
import highPriorityIcon from '../assets/PAlta.svg'

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const PRIORITY_COLORS: Record<Priority, string> = { bajo: '#EAB308', medio: '#F97316', alto: '#EF4444' }

const triangleIcon = (prioridad: Priority) => {
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

const userIcon = L.divIcon({
  html: `
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:0;background:rgba(59,130,246,0.25);border-radius:50%;animation:pulse 2s infinite;"></div>
      <div style="position:absolute;top:3px;left:3px;width:14px;height:14px;background:#3B82F6;border:2.5px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.6);"></div>
    </div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

function ClickHandler({ onMapClick }: { onMapClick: (point: Point) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

function RecenterMap({ center }: { center: Point }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom(), { animate: true })
  }, [center?.lat, center?.lng]) // eslint-disable-line
  return null
}

interface MapViewProps {
  onMapClick: (point: Point) => void
}

export default function MapView({ onMapClick }: MapViewProps) {
  const { userLocation, reports, CHICLAYO } = useApp()
  const center = userLocation ?? CHICLAYO

  const customLowPriorityIcon = useMemo(() => new L.Icon({
    iconUrl: lowPriorityIcon,
    iconSize: [35, 45],
    iconAnchor: [17, 45],
    popupAnchor: [0, -40],
  }), []);

  const customMidPriorityIcon = useMemo(() => new L.Icon({
    iconUrl: midPriorityIcon,
    iconSize: [35, 45],
    iconAnchor: [17, 45],
    popupAnchor: [0, -40],
  }), []);

  const customHighPriorityIcon = useMemo(() => new L.Icon({
    iconUrl: highPriorityIcon,
    iconSize: [35, 45],
    iconAnchor: [17, 45],
    popupAnchor: [0, -40],
  }), []);

  const getMarkerIcon = (r: Report) => {
    switch (r.prioridad) {
      case 'alto': return customHighPriorityIcon;
      case 'medio': return customMidPriorityIcon;
      case 'bajo': return customLowPriorityIcon;
    }
  }

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={16} zoomControl={false} className="w-full h-full">
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onMapClick={onMapClick} />

      {userLocation && <RecenterMap center={userLocation} />}

      {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}

      {reports.map(r => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={getMarkerIcon(r)}>
          <Popup className="text-sm">
            <strong className="capitalize">Bache de Nivel {r.prioridad}</strong>
            {r.descripcion && <p className="mt-1 text-gray-600">{r.descripcion}</p>}
            {r.imagen_url && <img src={r.imagen_url} alt="bache" className="mt-2 rounded w-36 object-cover" />}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}