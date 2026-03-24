import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, extractScoreDigits } from '@/lib/utils/helpers'
import { Trophy, TrendingUp, Heart, Calendar, Star, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { DrawEngine } from './draw-engine'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, charity:charities(*)')
    .eq('id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })
    .limit(5)

  const { data: winnings } = await supabase
    .from('winnings')
    .select('*, draw:draws(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: upcomingDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'pending')
    .order('draw_date', { ascending: true })
    .limit(1)
    .single()

  const { data: participations } = await supabase
    .from('draw_participations')
    .select('*, draw:draws(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const lastDraw = participations?.[0]?.draw

  const userNumbers = scores && scores.length >= 5
    ? extractScoreDigits(scores.map(s => s.score))
    : null

  const totalWinnings = winnings?.reduce((sum, w) => sum + w.net_amount_cents, 0) || 0

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-surface-dark/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <Trophy className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Golf Charity</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-primary">Dashboard</Button>
            </Link>
            <Link href="/scores">
              <Button variant="ghost" size="sm">Scores</Button>
            </Link>
            <Link href="/charities">
              <Button variant="ghost" size="sm">Charities</Button>
            </Link>
            <Link href="/winnings">
              <Button variant="ghost" size="sm">Winnings</Button>
            </Link>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit">Sign Out</Button>
            </form>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'} 👋
          </h1>
          <p className="text-muted-foreground">
            {subscription
              ? 'Your subscription is active. Keep scoring to enter draws!'
              : 'Subscribe to unlock draws and start winning prizes'}
          </p>
        </div>

        {/* Subscription Status Banner */}
        {!subscription && (
          <GlassCard className="p-6 mb-8 border-primary/50 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Activate Your Account</h3>
                <p className="text-muted-foreground text-sm">
                  Subscribe to unlock monthly prize draws, track your scores, and support charities.
                </p>
              </div>
              <Link href="/subscribe">
                <Button className="bg-gold-gradient hover:opacity-90 text-black font-semibold">
                  View Plans <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Subscription</span>
            </div>
            <p className={`text-2xl font-bold ${subscription ? 'text-green-400' : 'text-yellow-400'}`}>
              {subscription ? 'Active' : 'Inactive'}
            </p>
            {subscription && (
              <p className="text-xs text-muted-foreground mt-1 capitalize">{subscription.plan_type}</p>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-gold/10">
                <TrendingUp className="h-5 w-5 text-accent-gold" />
              </div>
              <span className="text-sm text-muted-foreground">Scores</span>
            </div>
            <p className="text-2xl font-bold">{scores?.length || 0}/5</p>
            <p className="text-xs text-muted-foreground mt-1">For next draw</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Sparkles className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Draw Numbers</span>
            </div>
            {userNumbers ? (
              <div className="flex gap-1">
                {userNumbers.map((num, i) => (
                  <span key={i} className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center text-sm font-bold">
                    {num}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">—</p>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground">Total Winnings</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalWinnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">{winnings?.length || 0} wins</p>
          </GlassCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Score & Draw */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Scores */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Scores
                </h2>
                <Link href="/scores">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {scores && scores.length > 0 ? (
                <div className="space-y-3">
                  {scores.slice(0, 5).map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-lg">
                          {score.score}
                        </div>
                        <div>
                          <p className="font-medium">{score.course_name || 'Unknown Course'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(score.score_date)}</p>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="px-2 py-1 rounded text-xs bg-accent-gold/20 text-accent-gold">Latest</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">No scores recorded yet</p>
                  <Link href="/scores">
                    <Button variant="outline" size="sm">Add Your First Score</Button>
                  </Link>
                </div>
              )}
            </GlassCard>

            {/* Draw Engine */}
            {subscription && lastDraw && (
              <DrawEngine
                lastDrawNumber={userNumbers || []}
                lastDrawDate={lastDraw.draw_date}
                participationCount={participations?.length || 0}
              />
            )}
          </div>

          {/* Right Column - Charity & Quick Links */}
          <div className="space-y-6">
            {/* Charity */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                Your Charity
              </h2>

              {profile?.charity ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="font-semibold">{profile.charity.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.donation_percent}% of winnings
                  </p>
                  <Link href="/charities">
                    <Button variant="ghost" size="sm" className="mt-3">Change Charity</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-3">No charity selected</p>
                  <Link href="/charities">
                    <Button variant="outline" size="sm">Select Charity</Button>
                  </Link>
                </div>
              )}
            </GlassCard>

            {/* Upcoming Draw */}
            {upcomingDraw && (
              <GlassCard className="p-6" glow>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent-gold" />
                  Next Draw
                </h2>
                <p className="text-3xl font-bold text-accent-gold mb-1">
                  {formatCurrency(upcomingDraw.prize_pool_cents)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(upcomingDraw.draw_date, { month: 'long', day: 'numeric' })}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground mb-2">Prize Breakdown</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>5 Matches (Jackpot)</span>
                      <span className="text-accent-gold">{upcomingDraw.jackpot_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 Matches</span>
                      <span>{upcomingDraw.four_match_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3 Matches</span>
                      <span>{upcomingDraw.three_match_percent}%</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/scores" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" /> Add Score
                  </Button>
                </Link>
                <Link href="/winnings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="mr-2 h-4 w-4" /> View Winnings
                  </Button>
                </Link>
                <Link href="/charities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" /> Browse Charities
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  )
}
