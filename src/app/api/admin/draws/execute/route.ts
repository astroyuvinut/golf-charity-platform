import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { executeDraw } from '@/lib/draw/engine'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('is_admin')
    //   .eq('id', user.id)
    //   .single()
    // if (!profile?.is_admin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const { drawId, mode, prizePoolCents } = await request.json()

    if (!drawId) {
      return NextResponse.json({ error: 'Draw ID required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    // Get draw details
    const { data: draw, error: drawError } = await serviceSupabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (drawError || !draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    if (draw.status !== 'pending') {
      return NextResponse.json({ error: 'Draw already executed' }, { status: 400 })
    }

    // Execute the draw
    const result = await executeDraw({
      drawId,
      prizePoolCents: prizePoolCents || draw.prize_pool_cents,
      jackpotPercent: draw.jackpot_percent,
      fourMatchPercent: draw.four_match_percent,
      threeMatchPercent: draw.three_match_percent,
      mode: mode || 'random',
      executedBy: user.id,
    })

    return NextResponse.json({
      success: true,
      winningNumbers: result.winningNumbers,
      winners: result.winners,
      statistics: result.statistics,
    })
  } catch (error: any) {
    console.error('Draw execution error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to execute draw' },
      { status: 500 }
    )
  }
}
