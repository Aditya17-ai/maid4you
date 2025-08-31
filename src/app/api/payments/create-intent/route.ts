import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPaymentIntent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        customerId: session.user.id,
      },
      include: {
        maid: true,
        service: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking must be confirmed before payment' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: booking.totalPrice,
      currency: 'inr',
      bookingId: booking.id,
      customerId: session.user.id,
      maidId: booking.maidId,
    })

    // Save payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: booking.totalPrice,
        currency: 'INR',
        status: 'PENDING',
        stripePaymentId: paymentIntent.id,
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
