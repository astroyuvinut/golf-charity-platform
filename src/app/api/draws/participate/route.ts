import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { extractScoreDigits } from '@/lib/utils/helpers'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's latest 5 scores
  const { data: scores } = await supabase
    .from('scores')
    .select('score')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })
    .limit(5)

  if (!scores || scores.length < 5) {
    return NextResponse.json({
      error: 'Need at least 5 scores',
      scoresCount: scores?.length || 0
    }, { status: 400 })
  }

  // Get current active draw
  const { data: draw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'pending')
    .order('draw_date', { ascending: true })
    .limit(1)
    .single()

  if (!draw) {
    return NextResponse.json({ error: 'No active draw' }, { status: 404 })
  }

  // Check if already participated
  const { data: existingParticipation } = await supabase
    .from('draw_participations')
    .select('id')
    .eq('draw_id', draw.id)
    .eq('user_id', user.id)
    .single()

  if (existingParticipation) {
    return NextResponse.json({ error: 'Already participated', participation: existingParticipation }, { status: 400 })
  }

  // Generate numbers from scores
  const numbers = extractScoreDigits(scores.map(s => s.score))

  // Create participation
  const { data, error } = await supabase
    .from('draw_participations')
    .insert({
      draw_id: draw.id,
      user_id: user.id,
      numbers,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    participation: data,
    numbers,
    draw,
  })
}
