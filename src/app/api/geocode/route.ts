import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    if (response.data.results.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const location = response.data.results[0].geometry.location

    return NextResponse.json({
      location: {
        latitude: location.lat,
        longitude: location.lng,
      },
      formatted_address: response.data.results[0].formatted_address,
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    )
  }
}
