import OpenAI from 'openai'
import { prisma } from './prisma'
import { calculateDistance, Location } from './location'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RecommendationParams {
  userId: string
  location: Location
  serviceType?: string
  budget?: number
  urgency?: 'low' | 'medium' | 'high'
  preferences?: string[]
}

interface MaidRecommendation {
  maidId: string
  score: number
  reasons: string[]
  maid: any
}

export async function getAIRecommendations(params: RecommendationParams): Promise<MaidRecommendation[]> {
  try {
    // Get user's booking history
    const userHistory = await prisma.booking.findMany({
      where: { customerId: params.userId },
      include: {
        service: true,
        maid: {
          include: {
            user: true,
            services: {
              include: { service: true }
            }
          }
        },
        review: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get available maids
    const availableMaids = await prisma.maidProfile.findMany({
      where: {
        isActive: true,
        isVerified: true,
        user: {
          latitude: { not: null },
          longitude: { not: null }
        }
      },
      include: {
        user: true,
        services: {
          where: { isOffered: true },
          include: { service: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    // Filter by distance (within 25km)
    const nearbyMaids = availableMaids.filter(maid => {
      if (!maid.user.latitude || !maid.user.longitude) return false
      
      const distance = calculateDistance(
        params.location,
        { latitude: maid.user.latitude, longitude: maid.user.longitude }
      )
      
      return distance <= 25
    })

    // Calculate recommendation scores
    const recommendations: MaidRecommendation[] = []

    for (const maid of nearbyMaids) {
      const score = await calculateMaidScore(maid, params, userHistory)
      const reasons = generateRecommendationReasons(maid, params, userHistory)
      
      recommendations.push({
        maidId: maid.id,
        score,
        reasons,
        maid: {
          ...maid,
          distance: calculateDistance(
            params.location,
            { latitude: maid.user.latitude!, longitude: maid.user.longitude! }
          )
        }
      })
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

async function calculateMaidScore(
  maid: any, 
  params: RecommendationParams, 
  userHistory: any[]
): Promise<number> {
  let score = 0
  
  // Base score from rating
  score += maid.rating * 20
  
  // Distance factor (closer is better)
  const distance = calculateDistance(
    params.location,
    { latitude: maid.user.latitude, longitude: maid.user.longitude }
  )
  score += Math.max(0, (25 - distance) * 2)
  
  // Service match
  if (params.serviceType) {
    const hasService = maid.services.some((s: any) => s.service.category === params.serviceType)
    if (hasService) score += 30
  }
  
  // Budget compatibility
  if (params.budget && maid.hourlyRate <= params.budget) {
    score += 20
  }
  
  // Experience factor
  score += Math.min(maid.experience * 2, 20)
  
  // Background check bonus
  if (maid.backgroundCheck) score += 15
  
  // Previous positive experiences with similar customers
  const similarBookings = userHistory.filter(booking => 
    booking.service.category === params.serviceType
  )
  
  if (similarBookings.length > 0) {
    const avgRating = similarBookings.reduce((sum, booking) => 
      sum + (booking.review?.rating || 0), 0
    ) / similarBookings.length
    
    if (avgRating >= 4) score += 10
  }
  
  return Math.min(score, 100)
}

function generateRecommendationReasons(
  maid: any, 
  params: RecommendationParams, 
  userHistory: any[]
): string[] {
  const reasons: string[] = []
  
  if (maid.rating >= 4.5) {
    reasons.push(`Highly rated (${maid.rating.toFixed(1)}/5.0)`)
  }
  
  if (maid.backgroundCheck) {
    reasons.push('Background verified')
  }
  
  if (maid.experience >= 5) {
    reasons.push(`${maid.experience} years of experience`)
  }
  
  const distance = calculateDistance(
    params.location,
    { latitude: maid.user.latitude, longitude: maid.user.longitude }
  )
  
  if (distance <= 5) {
    reasons.push('Very close to your location')
  }
  
  if (params.budget && maid.hourlyRate <= params.budget * 0.8) {
    reasons.push('Budget-friendly pricing')
  }
  
  const recentReviews = maid.reviews.filter((review: any) => 
    new Date(review.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  if (recentReviews.length >= 3) {
    reasons.push('Recently active with positive reviews')
  }
  
  return reasons.slice(0, 3) // Limit to top 3 reasons
}

export async function getSmartSchedulingSuggestions(
  maidId: string,
  serviceId: string,
  preferredDate?: Date
): Promise<Date[]> {
  try {
    const maid = await prisma.maidProfile.findUnique({
      where: { id: maidId },
      include: {
        bookings: {
          where: {
            scheduledDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            }
          }
        }
      }
    })

    if (!maid) return []

    const suggestions: Date[] = []
    const availability = maid.availability as any
    
    // Generate suggestions for the next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const dayOfWeek = date.getDay()
      const dayAvailability = availability[dayOfWeek.toString()]
      
      if (dayAvailability && dayAvailability.available) {
        // Check for conflicts with existing bookings
        const hasConflict = maid.bookings.some(booking => {
          const bookingDate = new Date(booking.scheduledDate)
          return bookingDate.toDateString() === date.toDateString()
        })
        
        if (!hasConflict) {
          // Add available time slots
          dayAvailability.slots.forEach((slot: any) => {
            const suggestionDate = new Date(date)
            const [hours, minutes] = slot.start.split(':')
            suggestionDate.setHours(parseInt(hours), parseInt(minutes))
            
            if (suggestionDate > new Date()) {
              suggestions.push(suggestionDate)
            }
          })
        }
      }
    }
    
    return suggestions.slice(0, 6) // Return top 6 suggestions
  } catch (error) {
    console.error('Error generating scheduling suggestions:', error)
    return []
  }
}
