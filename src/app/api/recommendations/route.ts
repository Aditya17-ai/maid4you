import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIRecommendations } from '@/lib/recommendations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      latitude, 
      longitude, 
      serviceType, 
      budget, 
      urgency, 
      preferences 
    } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    const recommendations = await getAIRecommendations({
      userId: session.user.id,
      location: { latitude, longitude },
      serviceType,
      budget,
      urgency,
      preferences
    })

    return NextResponse.json({
      recommendations,
      total: recommendations.length
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
