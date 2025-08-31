export interface Location {
  latitude: number
  longitude: number
}

export interface MaidWithDistance {
  id: string
  name: string
  distance: number
  location: Location
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  loc1: Location,
  loc2: Location
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    )
  })
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  try {
    const response = await fetch(
      `/api/geocode?address=${encodeURIComponent(address)}`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding failed')
    }
    
    const data = await response.json()
    return data.location
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(location: Location): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/reverse-geocode?lat=${location.latitude}&lng=${location.longitude}`
    )
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }
    
    const data = await response.json()
    return data.address
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Find maids within a certain radius of a location
 */
export function filterMaidsByDistance(
  maids: any[],
  userLocation: Location,
  maxDistance: number = 25
): MaidWithDistance[] {
  return maids
    .filter(maid => maid.user.latitude && maid.user.longitude)
    .map(maid => ({
      ...maid,
      distance: calculateDistance(
        userLocation,
        { 
          latitude: maid.user.latitude, 
          longitude: maid.user.longitude 
        }
      )
    }))
    .filter(maid => maid.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
}
