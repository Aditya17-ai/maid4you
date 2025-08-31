'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { getCurrentLocation, filterMaidsByDistance, Location } from '@/lib/location'
import Image from 'next/image'

interface Maid {
  id: string
  user: {
    name: string
    image?: string
    latitude: number
    longitude: number
  }
  bio: string
  rating: number
  totalReviews: number
  hourlyRate: number
  services: {
    service: {
      name: string
      category: string
    }
  }[]
  distance?: number
}

export default function MaidSearch() {
  const [maids, setMaids] = useState<Maid[]>([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [searchRadius, setSearchRadius] = useState(25)
  const [selectedService, setSelectedService] = useState<string>('')

  useEffect(() => {
    getCurrentUserLocation()
  }, [])

  const getCurrentUserLocation = async () => {
    try {
      const userLocation = await getCurrentLocation()
      setLocation(userLocation)
      searchMaids(userLocation)
    } catch (error) {
      console.error('Failed to get location:', error)
    }
  }

  const searchMaids = async (userLocation: Location) => {
    setLoading(true)
    try {
      const response = await fetch('/api/maids/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: searchRadius,
          service: selectedService,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMaids(data.maids)
      }
    } catch (error) {
      console.error('Failed to search maids:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, totalReviews: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({totalReviews} reviews)
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              <option value="HOUSEKEEPING">Housekeeping</option>
              <option value="DEEP_CLEANING">Deep Cleaning</option>
              <option value="COOKING">Cooking</option>
              <option value="LAUNDRY">Laundry</option>
              <option value="BABYSITTING">Babysitting</option>
              <option value="ELDERLY_CARE">Elderly Care</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius: {searchRadius} km
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => location && searchMaids(location)}
              disabled={!location || loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Maids'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maids.map((maid) => (
          <div key={maid.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Image
                  src={maid.user.image || '/default-avatar.png'}
                  alt={maid.user.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {maid.user.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {maid.distance?.toFixed(1)} km away
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">{maid.bio}</p>

              {renderStars(maid.rating, maid.totalReviews)}

              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {maid.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                    >
                      {service.service.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{maid.hourlyRate}/hr
                  </span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maids.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No maids found in your area. Try expanding your search radius.
          </p>
        </div>
      )}
    </div>
  )
}
