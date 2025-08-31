import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface PaymentIntentData {
  amount: number
  currency: string
  bookingId: string
  customerId: string
  maidId: string
}

export async function createPaymentIntent(data: PaymentIntentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to paise (INR cents)
      currency: data.currency,
      metadata: {
        bookingId: data.bookingId,
        customerId: data.customerId,
        maidId: data.maidId,
      },
      payment_method_types: ['card', 'upi'], // Support Indian payment methods
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw error
  }
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    })

    return refund
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}

export async function createConnectedAccount(maidData: {
  email: string
  firstName: string
  lastName: string
  phone: string
  country: string
}) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: maidData.country || 'IN', // Default to India
      email: maidData.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: maidData.firstName,
        last_name: maidData.lastName,
        email: maidData.email,
        phone: maidData.phone,
      },
      default_currency: 'inr', // Set default currency to INR
    })

    return account
  } catch (error) {
    console.error('Error creating connected account:', error)
    throw error
  }
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}
