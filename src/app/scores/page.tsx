'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/shared/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatDate, extractScoreDigits } from '@/lib/utils/helpers'
import { Plus, Trash2, Loader2, Golf, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Score = Database['public']['Tables']['scores']['Row']

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [newScore, setNewScore] = useState({
    score: '',
    course_name: '',
    score_date: new Date().toISOString().split('T')[0],
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchScores = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('score_date', { ascending: false })
        .limit(5)

      if (data) setScores(data)
      setLoading(false)
    }
    fetchScores()
  }, [])

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const scoreNum = parseInt(newScore.score)
    if (scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45')
      setSubmitting(false)
      return
    }

    // Check if we already have 5 scores - if so, remove oldest
    if (scores.length >= 5) {
      const oldestScore = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldestScore.id)
    }

    const { error: insertError } = await supabase.from('scores').insert({
      user_id: user.id,
      score: scoreNum,
      course_name: newScore.course_name || null,
      score_date: newScore.score_date,
      holes_played: 18,
    })

    if (insertError) {
      setError('Failed to add score')
      setSubmitting(false)
      return
    }

    // Refresh scores
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5)

    if (data) setScores(data)
    setShowForm(false)
    setNewScore({ score: '', course_name: '', score_date: new Date().toISOString().split('T')[0] })
    setSubmitting(false)
    router.refresh()
  }

  const handleDeleteScore = async (id: string) => {
    await supabase.from('scores').delete().eq('id', id)
    setScores(scores.filter(s => s.id !== id))
    router.refresh()
  }

  const userNumbers = scores.length >= 5 ? extractScoreDigits(scores.map(s => s.score)) : null

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-surface-dark/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                <Golf className="h-5 w-5 text-black" />
              </div>
              <span className="font-bold text-lg">Scores</span>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? 'Cancel' : <><Plus className="mr-1 h-4 w-4" /> Add Score</>}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Draw Numbers Preview */}
        <GlassCard className="p-6 mb-8" glow={!!userNumbers}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent-gold" />
              Your Draw Numbers
            </h2>
            <span className="text-xs text-muted-foreground">
              {scores.length}/5 scores
            </span>
          </div>

          {userNumbers ? (
            <div className="flex justify-center gap-3">
              {userNumbers.map((num, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center text-2xl font-bold text-black shadow-lg"
                >
                  {num}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                {5 - scores.length} more score{5 - scores.length !== 1 ? 's' : ''} needed to generate draw numbers
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            Numbers are derived from the last digit of your 5 most recent scores
          </p>
        </GlassCard>

        {/* Add Score Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Add New Score</h3>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleAddScore} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Score (1-45)</label>
                      <Input
                        type="number"
                        min="1"
                        max="45"
                        placeholder="18"
                        value={newScore.score}
                        onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Input
                        type="date"
                        value={newScore.score_date}
                        onChange={(e) => setNewScore({ ...newScore, score_date: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Course Name (optional)</label>
                    <Input
                      type="text"
                      placeholder="Pebble Beach Golf Links"
                      value={newScore.course_name}
                      onChange={(e) => setNewScore({ ...newScore, course_name: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gold-gradient hover:opacity-90 text-black font-semibold" disabled={submitting}>
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Score'}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scores List */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Score History</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : scores.length > 0 ? (
            <div className="space-y-3">
              {scores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center text-xl font-bold text-black">
                      {score.score}
                    </div>
                    <div>
                      <p className="font-medium">{score.course_name || 'Unknown Course'}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(score.score_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {extractScoreDigits([score.score])[0]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteScore(score.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Golf className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No scores yet. Add your first score above!</p>
            </div>
          )}
        </GlassCard>
      </div>
    </main>
  )
}
