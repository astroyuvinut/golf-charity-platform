import Link from 'next/link'
import { ArrowRight, Trophy, Heart, TrendingUp, Shield, Star, Golf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/glass-card'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 md:px-0">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-gold/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Star className="h-4 w-4 text-accent-gold" />
            <span className="text-sm">New: Monthly Prize Draws</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Play Golf.
            <br />
            <span className="text-gradient-gold">Win Big.</span>
            <br />
            Give Back.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join the premier golf subscription platform where your scores unlock
            monthly prize draws and your winnings support causes you care about.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="xl" className="bg-gold-gradient hover:opacity-90 text-black font-semibold px-8 button-glow">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button size="xl" variant="outline" className="px-8">
                <Heart className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <GlassCard className="p-6 card-hover">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">5</p>
              <p className="text-sm text-muted-foreground">Scores to Enter</p>
            </GlassCard>
            <GlassCard className="p-6 card-hover" glow>
              <p className="text-3xl md:text-4xl font-bold text-accent-gold mb-1">$5K</p>
              <p className="text-sm text-muted-foreground">Monthly Prizes</p>
            </GlassCard>
            <GlassCard className="p-6 card-hover">
              <p className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">10%</p>
              <p className="text-sm text-muted-foreground">Min. to Charity</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Simple steps to start winning and giving
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Subscribe',
                description: 'Choose monthly or yearly. Unlock all features and enter monthly draws.',
                icon: Trophy,
              },
              {
                step: '02',
                title: 'Track Scores',
                description: 'Log your last 5 golf scores using Stableford format. Automatic entry.',
                icon: TrendingUp,
              },
              {
                step: '03',
                title: 'Win & Give',
                description: 'Match your digits to win prizes. Choose how much to donate to charity.',
                icon: Heart,
              },
            ].map((item, index) => (
              <GlassCard key={item.step} className="p-8 relative overflow-hidden card-hover">
                <span className="absolute top-4 right-4 text-8xl font-bold text-white/5">
                  {item.step}
                </span>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Structure */}
      <section className="py-24 px-4 relative bg-surface-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Prize Structure</h2>
            <p className="text-muted-foreground text-lg">
              Multiple ways to win with every draw
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                matches: '5 Matches',
                percent: 40,
                title: 'Jackpot',
                colorClass: 'text-accent-gold',
              },
              {
                matches: '4 Matches',
                percent: 35,
                title: 'Second Tier',
                colorClass: 'text-primary',
              },
              {
                matches: '3 Matches',
                percent: 25,
                title: 'Third Tier',
                colorClass: 'text-purple-400',
              },
            ].map((prize) => (
              <GlassCard key={prize.title} className="p-8 text-center card-hover" glow={prize.colorClass === 'text-accent-gold'}>
                <div className={`text-5xl font-bold mb-4 ${prize.colorClass}`}>
                  {prize.percent}%
                </div>
                <h3 className="text-xl font-semibold mb-2">{prize.title}</h3>
                <p className="text-muted-foreground mb-4">{prize.matches}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Built for Modern Golfers
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Trophy,
                    title: 'Premium Experience',
                    description: 'A platform that feels as good as your best round. No cluttered interfaces, no dated designs.',
                  },
                  {
                    icon: Shield,
                    title: 'Secure & Reliable',
                    description: 'Bank-level security for your data and payments. Stripe-powered subscriptions.',
                  },
                  {
                    icon: Heart,
                    title: 'Make an Impact',
                    description: 'Your donations directly support verified charities making real change.',
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4 animate-fade-in-up">
                    <div className="p-3 rounded-xl bg-primary/10 h-fit">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GlassCard className="p-8 card-hover" glow>
              <div className="text-center">
                <Golf className="h-20 w-20 mx-auto mb-6 text-primary" />
                <h3 className="text-2xl font-bold mb-4">Ready to Tee Off?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of golfers already playing for prizes and purpose.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="bg-gold-gradient hover:opacity-90 text-black button-glow">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative bg-surface-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Every Swing Counts.
            <br />
            <span className="text-gradient-gold">Every Win Gives Back.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start your subscription today and become part of a community
            that loves golf as much as giving back.
          </p>
          <Link href="/signup">
            <Button size="xl" className="bg-gold-gradient hover:opacity-90 text-black font-semibold px-10 button-glow">
              View Pricing Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                <Golf className="h-5 w-5 text-black" />
              </div>
              <span className="font-bold text-lg">Golf Charity</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="link-hover">
                Privacy
              </Link>
              <Link href="#" className="link-hover">
                Terms
              </Link>
              <Link href="#" className="link-hover">
                Contact
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 Golf Charity. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
