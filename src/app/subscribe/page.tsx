'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/stripe/server'
import { Check, ArrowLeft, Loader2, Zap } from 'lucide-react'

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setLoading(planType)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/subscribe')
      return
    }

    const plan = PLANS[planType]

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, priceId: plan.priceId }),
      })

      const { url, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        setLoading(null)
        return
      }

      if (url) {
        window.location.href = url
      } else {
        // For demo mode, create subscription directly
        const { error: subError } = await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          payment_status: 'active',
          price_cents: plan.price,
          currency: 'USD',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        })

        if (subError) {
          setError('Failed to create subscription')
          setLoading(null)
          return
        }

        router.push('/dashboard?subscribed=true')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  const plans = [
    {
      type: 'monthly' as const,
      name: 'Monthly',
      price: 29.99,
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Access to all features',
        'Monthly prize draws',
        'Score tracking',
        'Charity donations',
        'Winner verification',
      ],
      popular: false,
    },
    {
      type: 'yearly' as const,
      name: 'Yearly',
      price: 249.99,
      period: '/year',
      description: 'Best value - save 30%',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Early access to features',
        'Exclusive yearly prizes',
      ],
      popular: true,
    },
  ]

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-surface-dark/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg">Subscribe</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock monthly prize draws, track your scores, and make a difference with charity donations.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className={`p-8 relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}
                glow={plan.popular}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.type)}
                  disabled={loading !== null}
                  className={`w-full ${plan.popular ? 'bg-gold-gradient hover:opacity-90 text-black font-semibold' : ''}`}
                >
                  {loading === plan.type ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `Get Started with ${plan.name}`
                  )}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Cancel anytime. No hidden fees. Secure payment via Stripe.
        </p>
      </div>
    </main>
  )
}
