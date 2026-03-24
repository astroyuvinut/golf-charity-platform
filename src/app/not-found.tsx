import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/glass-card'
import { RotateCcw } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-hero-gradient">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <GlassCard className="p-8 text-center max-w-md relative z-10">
        <div className="text-6xl font-bold mb-4 text-gradient-gold">404</div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-gold-gradient hover:opacity-90 text-black">
            <RotateCcw className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </GlassCard>
    </main>
  )
}
