import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type {
  ChallengeDifficulty,
  ChallengeType,
} from '@/features/challenges/schemas/challengeSchemas'

export type PlayerChallenge = {
  id: string
  title: string
  author: string
  category: string
  description: string
  type: ChallengeType
  difficulty: ChallengeDifficulty
  hint: string | null
  points: number
  externalUrl: string | null
  solved: boolean
}

export async function listChallengesForPlayer(
  playerId: string,
  roomId: string
): Promise<PlayerChallenge[]> {
  const supabase = createAdminClient()
  const [{ data: challenges, error }, { data: solves, error: solveError }] = await Promise.all([
    supabase
      .from('challenges')
      .select('id,title,author,category,description,type,difficulty,hint,points,external_url')
      .eq('room_id', roomId)
      .eq('active', true)
      .order('points')
      .order('title'),
    supabase.from('solves').select('challenge_id').eq('player_id', playerId).eq('room_id', roomId),
  ])
  if (error || solveError) throw new Error('Unable to load challenges.')
  const solved = new Set((solves ?? []).map((row) => row.challenge_id))
  return (challenges ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    description: row.description,
    type: row.type as ChallengeType,
    difficulty: row.difficulty as ChallengeDifficulty,
    hint: row.hint,
    points: row.points,
    externalUrl: row.external_url,
    solved: solved.has(row.id),
  }))
}
