'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Heart, Globe, Mail, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Database } from '@/types/database'

type Charity = Database['public']['Tables']['charities']['Row']

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [charitiesResult, profileResult] = await Promise.all([
        supabase.from('charities').select('*').eq('is_active', true).order('name'),
        supabase.from('profiles').select('selected_charity_id, donation_percent').eq('id', user.id).single(),
      ])

      if (charitiesResult.data) setCharities(charitiesResult.data)
      if (profileResult.data) setSelectedCharity(profileResult.data.selected_charity_id)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSelectCharity = async (charityId: string) => {
    setUpdating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ selected_charity_id: charityId })
      .eq('id', user.id)

    setSelectedCharity(charityId)
    setUpdating(false)
  }

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-surface-dark/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-400" />
            </div>
            <span className="font-bold text-lg">Charities</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Support a Cause</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a charity to receive a percentage of your winnings. Every contribution makes a difference.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity, index) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className={`p-6 cursor-pointer transition-all ${
                    selectedCharity === charity.id
                      ? 'border-green-500 shadow-lg shadow-green-500/20'
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => handleSelectCharity(charity.id)}
                >
                  <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-7 w-7 text-red-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-center mb-2">{charity.name}</h3>

                  {charity.description && (
                    <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
                      {charity.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {charity.website_url && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span className="truncate">{charity.website_url.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                    {charity.contact_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{charity.contact_email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Min. donation</span>
                      <span className="font-semibold text-red-400">{charity.minimum_donation_percent}%</span>
                    </div>
                  </div>

                  {selectedCharity === charity.id && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">Selected</span>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {selectedCharity && (
          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gold-gradient hover:opacity-90 text-black font-semibold">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
