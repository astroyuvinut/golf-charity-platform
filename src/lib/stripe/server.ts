import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: 2999,
    interval: 'month' as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    name: 'Yearly Plan',
    price: 24999,
    interval: 'year' as const,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
  },
} as const

export type PlanType = keyof typeof PLANS
