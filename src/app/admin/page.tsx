'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils/helpers'
import { Users, Trophy, DollarSign, Settings, Loader2, Check, X, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']
type Draw = Database['public']['Tables']['draws']['Row']
type Winning = Database['public']['Tables']['winnings']['Row']

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [recentWinnings, setRecentWinnings] = useState<(Winning & { profile?: Profile })[]>([])
  const [activeDraw, setActiveDraw] = useState<Draw | null>(null)
  const [tab, setTab] = useState<'overview' | 'users' | 'draws' | 'winnings'>('overview')
  const [drawConfig, setDrawConfig] = useState({
    mode: 'random' as 'random' | 'weighted',
    prizePool: 500000, // $5000 in cents
  })
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: usersData } = await supabase.from('profiles').select('*').limit(50)
    const { data: subsData } = await supabase.from('subscriptions').select('*').limit(50)
    const { data: drawData } = await supabase.from('draws').select('*').eq('status', 'pending').single()
    const { data: winningsData } = await supabase
      .from('winnings')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (usersData) setUsers(usersData)
    if (subsData) setSubscriptions(subsData)
    if (drawData) setActiveDraw(drawData)
    if (winningsData) setRecentWinnings(winningsData)
    setLoading(false)
  }

  if (typeof window !== 'undefined' && !loading && users.length === 0) {
    fetchData()
  }

  const handleRunDraw = async () => {
    if (!activeDraw) return
    setActionLoading('draw')

    try {
      const response = await fetch('/api/admin/draws/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawId: activeDraw.id,
          mode: drawConfig.mode,
          prizePoolCents: drawConfig.prizePool,
        }),
      })

      if (response.ok) {
        await fetchData()
        alert('Draw executed successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (err) {
      alert('Failed to execute draw')
    }

    setActionLoading(null)
  }

  const handleUpdateWinning = async (winningId: string, status: 'approved' | 'rejected' | 'paid') => {
    setActionLoading(winningId)
    await supabase.from('winnings').update({
      verification_status: status === 'paid' ? 'approved' : status,
      payout_status: status === 'paid' ? 'paid' : undefined,
      verified_at: status !== 'paid' ? new Date().toISOString() : undefined,
    }).eq('id', winningId)
    await fetchData()
    setActionLoading(null)
  }

  const stats = {
    totalUsers: users.length,
    activeSubs: subscriptions.filter(s => s.status === 'active').length,
    totalWinnings: recentWinnings.reduce((sum, w) => sum + w.gross_amount_cents, 0),
    pendingVerifications: recentWinnings.filter(w => w.verification_status === 'pending').length,
  }

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-surface-dark/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <Settings className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSubs}</p>
                <p className="text-xs text-muted-foreground">Active Subs</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-gold/10">
                <DollarSign className="h-5 w-5 text-accent-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalWinnings)}</p>
                <p className="text-xs text-muted-foreground">Total Awarded</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                <p className="text-xs text-muted-foreground">Pending Verify</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {(['overview', 'users', 'draws', 'winnings'] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab(t)}
              className={tab === t ? 'bg-primary' : ''}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Draw */}
            {activeDraw && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Active Draw</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prize Pool</span>
                    <span className="text-2xl font-bold text-accent-gold">
                      {formatCurrency(activeDraw.prize_pool_cents)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draw Date</span>
                    <span>{formatDate(activeDraw.draw_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jackpot %</span>
                    <span>{activeDraw.jackpot_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">4 Match %</span>
                    <span>{activeDraw.four_match_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3 Match %</span>
                    <span>{activeDraw.three_match_percent}%</span>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <label className="text-sm font-medium mb-2 block">Draw Mode</label>
                    <select
                      className="w-full p-2 rounded-lg bg-white/5 border border-white/10 mb-3"
                      value={drawConfig.mode}
                      onChange={(e) => setDrawConfig({ ...drawConfig, mode: e.target.value as 'random' | 'weighted' })}
                    >
                      <option value="random">Random</option>
                      <option value="weighted">Weighted (by score frequency)</option>
                    </select>
                    <Button
                      onClick={handleRunDraw}
                      disabled={actionLoading === 'draw'}
                      className="w-full bg-gold-gradient hover:opacity-90 text-black font-semibold"
                    >
                      {actionLoading === 'draw' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Execute Draw'}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Pending Verifications */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pending Verifications</h3>
              {recentWinnings.filter(w => w.verification_status === 'pending').length > 0 ? (
                <div className="space-y-3">
                  {recentWinnings
                    .filter(w => w.verification_status === 'pending')
                    .slice(0, 5)
                    .map((winning) => (
                      <div key={winning.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <p className="font-medium">{winning.profile?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{winning.prize_tier} - {formatCurrency(winning.net_amount_cents)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleUpdateWinning(winning.id, 'approved')}>
                            <Check className="h-4 w-4 text-green-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdateWinning(winning.id, 'rejected')}>
                            <X className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No pending verifications</p>
              )}
            </GlassCard>
          </div>
        )}

        {tab === 'users' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Users ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-white/10">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Charity</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 20).map((user) => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3">{user.full_name || '—'}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.selected_charity_id ? 'Yes' : 'No'}</td>
                      <td className="py-3">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {tab === 'winnings' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Winnings</h3>
            <div className="space-y-3">
              {recentWinnings.map((winning) => (
                <div key={winning.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-gold/20 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-accent-gold" />
                    </div>
                    <div>
                      <p className="font-medium">{winning.profile?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{winning.prize_tier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{formatCurrency(winning.net_amount_cents)}</p>
                    <p className={`text-xs ${
                      winning.payout_status === 'paid' ? 'text-green-400' :
                      winning.payout_status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {winning.payout_status}
                    </p>
                  </div>
                  {winning.payout_status !== 'paid' && winning.verification_status === 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateWinning(winning.id, 'paid')}>
                      Mark Paid
                    </Button>
                  )}
                </div>
              ))}
              {recentWinnings.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No winnings yet</p>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </main>
  )
}
