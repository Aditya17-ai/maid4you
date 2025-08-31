'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  StarIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface Booking {
  id: string
  scheduledDate: string
  status: string
  totalPrice: number
  address: string
  service: {
    name: string
    category: string
  }
  maid: {
    user: {
      name: string
      image?: string
    }
    rating: number
    totalReviews: number
  }
  review?: {
    rating: number
    comment: string
  }
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    if (session.user.role !== 'CUSTOMER') {
      router.push('/dashboard/maid')
      return
    }
    
    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/customer')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'upcoming':
        return ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)
      case 'completed':
        return booking.status === 'COMPLETED'
      case 'cancelled':
        return booking.status === 'CANCELLED'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
            <Link
              href="/search"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Book New Service
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-bold text-gray-900">₹{booking.totalPrice}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.service.name}</h3>
                
                <div className="flex items-center mb-3">
                  <Image
                    src={booking.maid.user.image || '/default-avatar.png'}
                    alt={booking.maid.user.name}
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{booking.maid.user.name}</p>
                    {renderStars(booking.maid.rating)}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {new Date(booking.scheduledDate).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {booking.address}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/booking/${booking.id}`}
                    className="flex-1 bg-indigo-600 text-white text-center py-2 rounded-md hover:bg-indigo-700 text-sm"
                  >
                    View Details
                  </Link>
                  {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
                    <Link
                      href={`/booking/${booking.id}/chat`}
                      className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {booking.status === 'COMPLETED' && !booking.review && (
                  <Link
                    href={`/booking/${booking.id}/review`}
                    className="mt-2 block w-full bg-yellow-500 text-white text-center py-2 rounded-md hover:bg-yellow-600 text-sm"
                  >
                    Leave Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'upcoming' 
                ? 'No upcoming bookings' 
                : activeTab === 'completed'
                ? 'No completed bookings'
                : 'No cancelled bookings'
              }
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/search"
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                Book Your First Service
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
