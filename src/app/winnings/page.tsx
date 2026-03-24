'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils/helpers'
import { Trophy, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Upload, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Database } from '@/types/database'

type Winning = Database['public']['Tables']['winnings']['Row'] & {
  draw?: Database['public']['Tables']['draws']['Row'] | null
}

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<Winning[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchWinnings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('winnings')
        .select('*, draw:draws(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setWinnings(data)
      setLoading(false)
    }
    fetchWinnings()
  }, [])

  const handleUploadProof = async (winningId: string) => {
    setUploading(winningId)
    // In production, this would open a file picker and upload to storage
    // For now, we'll simulate marking as verified
    setTimeout(() => {
      setUploading(null)
    }, 1500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3" /> Approved</span>
      case 'rejected':
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-500/20 text-red-400"><XCircle className="h-3 w-3" /> Rejected</span>
      case 'pending':
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3" /> Pending</span>
      default:
        return null
    }
  }

  const getPayoutBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400">Paid</span>
      case 'processing':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">Processing</span>
      case 'pending':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>
      case 'failed':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/20 text-red-400">Failed</span>
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-surface-dark/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-accent-gold" />
            </div>
            <span className="font-bold text-lg">Winnings</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Winnings</h1>
          <p className="text-muted-foreground">
            Track your prizes, upload verification, and see payout status.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : winnings.length > 0 ? (
          <div className="space-y-4">
            {winnings.map((winning, index) => (
              <motion.div
                key={winning.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-gold to-yellow-600 flex items-center justify-center">
                        <Trophy className="h-7 w-7 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{winning.prize_tier || 'Prize'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {winning.draw ? formatDate(winning.draw.draw_date) : 'Draw'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(winning.verification_status)}
                          {getPayoutBadge(winning.payout_status)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">
                          {formatCurrency(winning.net_amount_cents)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gross: {formatCurrency(winning.gross_amount_cents)} | Charity: {formatCurrency(winning.charity_deduction_cents)}
                      </p>

                      {winning.verification_status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => handleUploadProof(winning.id)}
                          disabled={uploading === winning.id}
                        >
                          {uploading === winning.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Proof
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Winnings Yet</h3>
            <p className="text-muted-foreground mb-6">
              Keep playing and entering draws to win prizes!
            </p>
            <Link href="/scores">
              <Button>Add Scores</Button>
            </Link>
          </GlassCard>
        )}
      </div>
    </main>
  )
}
