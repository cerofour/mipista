interface NominatimAddress {
  road?: string
  pedestrian?: string
  footway?: string
  house_number?: string
  suburb?: string
  neighbourhood?: string
}

interface NominatimResponse {
  display_name?: string
  address?: NominatimAddress
}

function formatAddress(data: NominatimResponse): string | null {
  const a = data.address
  if (!a) return data.display_name ?? null

  const street = a.road || a.pedestrian || a.footway
  if (street) {
    return a.house_number ? `${street} ${a.house_number}` : street
  }
  return a.suburb || a.neighbourhood || data.display_name || null
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' }, signal }
    )
    if (!res.ok) return null
    const data: NominatimResponse = await res.json()
    return formatAddress(data)
  } catch {
    return null // incluye AbortError — se ignora silenciosamente
  }
}