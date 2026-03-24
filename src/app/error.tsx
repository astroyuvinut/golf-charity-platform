'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/glass-card'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-hero-gradient">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <GlassCard className="p-8 text-center max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="bg-black/50 rounded p-3 text-xs text-red-400 mb-6 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}
        <Button
          onClick={() => reset()}
          className="bg-gold-gradient hover:opacity-90 text-black w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </GlassCard>
    </main>
  )
}
