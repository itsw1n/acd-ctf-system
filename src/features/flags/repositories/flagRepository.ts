import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export async function findChallengeByFlagHash(flagHash: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,category,points')
    .eq('flag_hash', flagHash)
    .eq('active', true)
    .maybeSingle()

  if (error) throw new Error(`Unable to validate flag: ${error.message}`)
  return data
}

export async function createSolve(input: {
  playerId: string
  challengeId: string
  pointsAwarded: number
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('solves').insert({
    player_id: input.playerId,
    challenge_id: input.challengeId,
    points_awarded: input.pointsAwarded,
  })

  if (!error) return { created: true as const }
  if (error.code === '23505') return { created: false as const, duplicate: true as const }

  throw new Error(`Unable to record solve: ${error.message}`)
}
