import { createServiceClient } from '@/lib/supabase/server'
import { extractScoreDigits, generateRandomNumbers, calculateMatches } from '@/lib/utils/helpers'

interface DrawConfig {
  drawId: string
  prizePoolCents: number
  jackpotPercent: number
  fourMatchPercent: number
  threeMatchPercent: number
  mode: 'random' | 'weighted'
  executedBy: string
}

interface DrawResult {
  winningNumbers: number[]
  winners: {
    userId: string
    participationId: string
    matchCount: number
    tier: string
    grossAmount: number
    charityDeduction: number
    netAmount: number
  }[]
  statistics: {
    totalParticipants: number
    fiveMatches: number
    fourMatches: number
    threeMatches: number
    noMatches: number
  }
}

export async function executeDraw(config: DrawConfig): Promise<DrawResult> {
  const supabase = createServiceClient()

  const { data: participations, error: participationError } = await supabase
    .from('draw_participations')
    .select(`
      id,
      user_id,
      numbers,
      profile:profiles(donation_percent)
    `)
    .eq('draw_id', config.drawId)

  if (participationError) {
    throw new Error(`Failed to fetch participations: ${participationError.message}`)
  }

  if (!participations || participations.length === 0) {
    throw new Error('No participations found for this draw')
  }

  let winningNumbers: number[]

  if (config.mode === 'weighted') {
    winningNumbers = generateWeightedNumbers(participations)
  } else {
    winningNumbers = generateRandomNumbers()
  }

  const prizePool = config.prizePoolCents
  const jackpotPool = Math.floor(prizePool * (config.jackpotPercent / 100))
  const fourMatchPool = Math.floor(prizePool * (config.fourMatchPercent / 100))
  const threeMatchPool = Math.floor(prizePool * (config.threeMatchPercent / 100))

  const winners: DrawResult['winners'] = []
  const statistics = {
    totalParticipants: participations.length,
    fiveMatches: 0,
    fourMatches: 0,
    threeMatches: 0,
    noMatches: 0,
  }

  for (const participation of participations) {
    const userNumbers = participation.numbers as number[]
    const matchCount = calculateMatches(userNumbers, winningNumbers)

    if (matchCount >= 3) {
      const profile = participation.profile as { donation_percent: number } | null
      const donationPercent = profile?.donation_percent || 10

      let grossAmount: number
      let tier: string

      switch (matchCount) {
        case 5:
          grossAmount = jackpotPool
          tier = 'Jackpot (5 Matches)'
          statistics.fiveMatches++
          break
        case 4:
          grossAmount = fourMatchPool
          tier = '4 Matches'
          statistics.fourMatches++
          break
        default:
          grossAmount = threeMatchPool
          tier = '3 Matches'
          statistics.threeMatches++
      }

      const tierWinnerCount = participations.filter(p => {
        const nums = p.numbers as number[]
        const matches = calculateMatches(nums, winningNumbers)
        return matches === matchCount
      }).length

      const splitGrossAmount = Math.floor(grossAmount / tierWinnerCount)
      const charityDeduction = Math.floor(splitGrossAmount * (donationPercent / 100))
      const netAmount = splitGrossAmount - charityDeduction

      winners.push({
        userId: participation.user_id,
        participationId: participation.id,
        matchCount,
        tier,
        grossAmount: splitGrossAmount,
        charityDeduction,
        netAmount,
      })
    } else {
      statistics.noMatches++
    }
  }

  await supabase
    .from('draws')
    .update({
      status: 'completed',
      winning_numbers: winningNumbers,
      executed_at: new Date().toISOString(),
      executed_by: config.executedBy,
    })
    .eq('id', config.drawId)

  for (const winner of winners) {
    await supabase
      .from('draw_participations')
      .update({
        match_count: winner.matchCount,
        prize_amount_cents: winner.grossAmount,
        is_winner: true,
      })
      .eq('id', winner.participationId)
  }

  for (const winner of winners) {
    await supabase.from('winnings').insert({
      user_id: winner.userId,
      draw_id: config.drawId,
      participation_id: winner.participationId,
      match_count: winner.matchCount,
      prize_tier: winner.tier,
      gross_amount_cents: winner.grossAmount,
      charity_deduction_cents: winner.charityDeduction,
      net_amount_cents: winner.netAmount,
      payout_status: 'pending',
      verification_status: 'pending',
    })
  }

  return {
    winningNumbers,
    winners,
    statistics,
  }
}

function generateWeightedNumbers(participations: any[]): number[] {
  const digitFrequency: number[][] = [0, 0, 0, 0, 0].map(() => Array(10).fill(0))

  for (const participation of participations) {
    const numbers = participation.numbers as number[]
    for (let i = 0; i < 5; i++) {
      digitFrequency[i][numbers[i]]++
    }
  }

  const winningNumbers: number[] = []
  for (let i = 0; i < 5; i++) {
    const weights = digitFrequency[i]
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    if (totalWeight === 0) {
      winningNumbers.push(Math.floor(Math.random() * 10))
    } else {
      let random = Math.random() * totalWeight
      for (let d = 0; d < 10; d++) {
        random -= weights[d]
        if (random <= 0) {
          winningNumbers.push(d)
          break
        }
      }
    }
  }

  return winningNumbers
}
