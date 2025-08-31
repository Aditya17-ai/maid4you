'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { getCurrentLocation, geocodeAddress } from '@/lib/location'
import toast from 'react-hot-toast'

const bookingSchema = z.object({
  maidId: z.string().min(1, 'Please select a maid'),
  serviceId: z.string().min(1, 'Please select a service'),
  scheduledDate: z.string().min(1, 'Please select a date'),
  scheduledTime: z.string().min(1, 'Please select a time'),
  duration: z.number().min(30, 'Minimum duration is 30 minutes'),
  address: z.string().min(1, 'Please enter your address'),
  specialInstructions: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  maidId?: string
  serviceId?: string
  onSuccess?: (bookingId: string) => void
}

export default function BookingForm({ maidId, serviceId, onSuccess }: BookingFormProps) {
  const { data: session } = useSession()
  const [services, setServices] = useState([])
  const [maids, setMaids] = useState([])
  const [selectedMaid, setSelectedMaid] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [availableSlots, setAvailableSlots] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      maidId: maidId || '',
      serviceId: serviceId || '',
      duration: 120, // 2 hours default
    }
  })

  const watchedValues = watch()

  useEffect(() => {
    fetchServices()
    if (!maidId) {
      fetchNearbyMaids()
    }
  }, [maidId])

  useEffect(() => {
    if (watchedValues.maidId && watchedValues.serviceId) {
      calculatePrice()
      fetchAvailableSlots()
    }
  }, [watchedValues.maidId, watchedValues.serviceId, watchedValues.duration])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const fetchNearbyMaids = async () => {
    try {
      const location = await getCurrentLocation()
      const response = await fetch('/api/maids/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 25
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMaids(data.maids)
      }
    } catch (error) {
      console.error('Failed to fetch maids:', error)
    }
  }

  const calculatePrice = async () => {
    if (!watchedValues.maidId || !watchedValues.serviceId || !watchedValues.duration) return

    try {
      const response = await fetch('/api/bookings/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maidId: watchedValues.maidId,
          serviceId: watchedValues.serviceId,
          duration: watchedValues.duration
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTotalPrice(data.totalPrice)
      }
    } catch (error) {
      console.error('Failed to calculate price:', error)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!watchedValues.maidId || !watchedValues.serviceId) return

    try {
      const response = await fetch(`/api/maids/${watchedValues.maidId}/availability?serviceId=${watchedValues.serviceId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots.map((slot: string) => new Date(slot)))
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
    }
  }

  const useCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation()
      const address = await fetch(`/api/reverse-geocode?lat=${location.latitude}&lng=${location.longitude}`)
        .then(res => res.json())
        .then(data => data.address)
      
      setValue('address', address)
      toast.success('Location updated!')
    } catch (error) {
      toast.error('Failed to get current location')
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true)
    try {
      // Geocode address to get coordinates
      const locationData = await geocodeAddress(data.address)
      if (!locationData) {
        toast.error('Invalid address')
        return
      }

      const bookingData = {
        ...data,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        scheduledDate: new Date(`${data.scheduledDate}T${data.scheduledTime}`),
        totalPrice
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Booking created successfully!')
        reset()
        onSuccess?.(result.booking.id)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking creation error:', error)
      toast.error('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service *
          </label>
          <select
            {...register('serviceId')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select a service</option>
            {services.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name} - ₹{service.basePrice}/hr
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
          )}
        </div>

        {/* Maid Selection */}
        {!maidId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Maid *
            </label>
            <select
              {...register('maidId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a maid</option>
              {maids.map((maid: any) => (
                <option key={maid.id} value={maid.id}>
                  {maid.user.name} - ₹{maid.hourlyRate}/hr - {maid.rating.toFixed(1)}★
                </option>
              ))}
            </select>
            {errors.maidId && (
              <p className="mt-1 text-sm text-red-600">{errors.maidId.message}</p>
            )}
          </div>
        )}

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              {...register('scheduledDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.scheduledDate && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              {...register('scheduledTime')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.scheduledTime && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <select
            {...register('duration', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>4 hours</option>
            <option value={480}>8 hours (Full day)</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              {...register('address')}
              placeholder="Enter your full address"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={useCurrentLocation}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 whitespace-nowrap"
            >
              Use Current
            </button>
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions
          </label>
          <textarea
            {...register('specialInstructions')}
            rows={3}
            placeholder="Any specific requirements or notes for the maid..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Price Summary */}
        {totalPrice > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-2xl font-bold text-indigo-600">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || totalPrice === 0}
          className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating Booking...' : 'Book Now'}
        </button>
      </form>
    </div>
  )
}
