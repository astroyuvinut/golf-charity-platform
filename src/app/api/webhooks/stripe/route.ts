import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      const planType = session.metadata?.planType

      if (userId && planType) {
        const plan = planType === 'monthly'
          ? { price: 2999, interval: 'month' }
          : { price: 24999, interval: 'year' }

        // Create or update subscription
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_type: planType,
          stripe_subscription_id: session.subscription,
          stripe_price_id: session.line_items?.data[0]?.price?.id,
          status: 'active',
          payment_status: 'active',
          price_cents: plan.price,
          currency: session.currency || 'usd',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        }, {
          onConflict: 'user_id',
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const userId = subscription.metadata?.userId

      if (userId) {
        await supabase.from('subscriptions').update({
          status: subscription.status === 'active' ? 'active' : 'canceled',
          payment_status: subscription.status === 'active' ? 'active' : 'canceled',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const userId = subscription.metadata?.userId

      if (userId) {
        await supabase.from('subscriptions').update({
          status: 'canceled',
          payment_status: 'canceled',
          canceled_at: new Date().toISOString(),
        }).eq('user_id', userId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const subscriptionId = invoice.subscription

      if (subscriptionId) {
        const { data } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (data) {
          await supabase.from('subscriptions').update({
            status: 'past_due',
            payment_status: 'past_due',
          }).eq('user_id', data.user_id)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
