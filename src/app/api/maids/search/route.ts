import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/location'

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, radius = 25, service, minRating, maxPrice } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Build service filter
    const serviceFilter = service ? {
      services: {
        some: {
          service: {
            category: service
          },
          isOffered: true
        }
      }
    } : {}

    // Build rating filter
    const ratingFilter = minRating ? {
      rating: {
        gte: minRating
      }
    } : {}

    // Build price filter
    const priceFilter = maxPrice ? {
      hourlyRate: {
        lte: maxPrice
      }
    } : {}

    const maids = await prisma.maidProfile.findMany({
      where: {
        isActive: true,
        isVerified: true,
        user: {
          latitude: { not: null },
          longitude: { not: null }
        },
        ...serviceFilter,
        ...ratingFilter,
        ...priceFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            latitude: true,
            longitude: true,
          }
        },
        services: {
          where: { isOffered: true },
          include: {
            service: {
              select: {
                name: true,
                category: true,
                basePrice: true
              }
            }
          }
        }
      }
    })

    // Filter by distance and calculate distances
    const maidsWithDistance = maids
      .filter(maid => {
        if (!maid.user.latitude || !maid.user.longitude) return false
        
        const distance = calculateDistance(
          { latitude, longitude },
          { 
            latitude: maid.user.latitude, 
            longitude: maid.user.longitude 
          }
        )
        
        return distance <= radius
      })
      .map(maid => ({
        ...maid,
        distance: calculateDistance(
          { latitude, longitude },
          { 
            latitude: maid.user.latitude!, 
            longitude: maid.user.longitude! 
          }
        )
      }))
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      maids: maidsWithDistance,
      total: maidsWithDistance.length,
      searchLocation: { latitude, longitude },
      radius
    })

  } catch (error) {
    console.error('Maid search error:', error)
    return NextResponse.json(
      { error: 'Failed to search maids' },
      { status: 500 }
    )
  }
}
