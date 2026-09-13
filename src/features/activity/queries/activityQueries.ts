import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type ActivityItem = {
  id: string
  solvedAt: string
  challenge: string
  category: string
  points: number
}

export async function getPlayerActivity(playerId: string): Promise<ActivityItem[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('solves')
    .select('id,solved_at,points_awarded,challenge_id')
    .eq('player_id', playerId)
    .order('solved_at', { ascending: false })

  if (error) throw new Error(`Unable to load activity: ${error.message}`)
  if (!data?.length) return []

  const challengeIds = [...new Set(data.map((solve) => solve.challenge_id))]

  const { data: challenges, error: challengeError } = await supabase
    .from('challenges')
    .select('id,title,category')
    .in('id', challengeIds)

  if (challengeError) {
    throw new Error(`Unable to load activity challenges: ${challengeError.message}`)
  }

  const challengeById = new Map((challenges ?? []).map((challenge) => [challenge.id, challenge]))

  return data.map((solve) => {
    const challenge = challengeById.get(solve.challenge_id)
    return {
      id: solve.id,
      solvedAt: solve.solved_at,
      challenge: challenge?.title ?? 'Unknown challenge',
      category: challenge?.category ?? 'Unknown',
      points: solve.points_awarded,
    }
  })
}

export async function getPlayerScore(playerId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('solves')
    .select('points_awarded')
    .eq('player_id', playerId)

  if (error) throw new Error(`Unable to load score: ${error.message}`)

  return (data ?? []).reduce((sum, solve) => sum + solve.points_awarded, 0)
}
