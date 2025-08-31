import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'charge.dispute.created':
        await handleDispute(event.data.object as Stripe.Dispute)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata')
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { stripePaymentId: paymentIntent.id },
    data: { status: 'COMPLETED' }
  })

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' }
  })

  // Create notification for maid
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, maid: { include: { user: true } } }
  })

  if (booking) {
    await prisma.notification.create({
      data: {
        userId: booking.maid.userId,
        title: 'Payment Received',
        message: `Payment received for booking with ${booking.customer.name}`,
        type: 'PAYMENT_RECEIVED'
      }
    })
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata')
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { stripePaymentId: paymentIntent.id },
    data: { status: 'FAILED' }
  })

  // You might want to notify the customer about the failed payment
}

async function handleDispute(dispute: Stripe.Dispute) {
  const charge = await stripe.charges.retrieve(dispute.charge as string)
  const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string)
  
  // Handle dispute logic here
  console.log('Payment dispute created:', dispute.id)
}
