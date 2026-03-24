'use client'

import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { Sparkles, HelpCircle } from 'lucide-react'

interface DrawEngineProps {
  lastDrawNumber: number[]
  lastDrawDate: string
  participationCount: number
}

export function DrawEngine({ lastDrawNumber, lastDrawDate, participationCount }: DrawEngineProps) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-gold" />
          Draw Numbers
        </h2>
        <Button variant="ghost" size="sm">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-4">Your numbers for the next draw</p>

        <div className="flex justify-center gap-3 mb-6">
          {lastDrawNumber.length === 5 ? (
            lastDrawNumber.map((num, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center text-2xl font-bold text-black shadow-lg"
              >
                {num}
              </div>
            ))
          ) : (
            <div className="col-span-5 flex items-center justify-center h-14 text-muted-foreground">
              Add 5 scores to generate numbers
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Based on last digit of each score. Updated automatically when you add scores.
        </p>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-2xl font-bold text-primary">{participationCount}</p>
            <p className="text-xs text-muted-foreground">Draws Entered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-gold">
              {lastDrawDate ? new Date(lastDrawDate).toLocaleDateString('en-US', { month: 'short' }) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Last Draw</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">40%</p>
            <p className="text-xs text-muted-foreground">Jackpot Odds</p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
