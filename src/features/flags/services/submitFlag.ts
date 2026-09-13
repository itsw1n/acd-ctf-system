import 'server-only'
import { sha256 } from '@/lib/security/hash'
import { createSolve, findChallengeByFlagHash } from '@/features/flags/repositories/flagRepository'

export type SubmitFlagResult =
  | { status: 'correct'; challenge: string; points: number }
  | { status: 'duplicate'; challenge: string }
  | { status: 'incorrect' }

export async function submitFlagForPlayer(
  playerId: string,
  submittedFlag: string
): Promise<SubmitFlagResult> {
  const normalized = submittedFlag.trim()
  const challenge = await findChallengeByFlagHash(sha256(normalized))

  if (!challenge) return { status: 'incorrect' }

  const solve = await createSolve({
    playerId,
    challengeId: challenge.id,
    pointsAwarded: challenge.points,
  })

  if (!solve.created) {
    return { status: 'duplicate', challenge: challenge.title }
  }

  return {
    status: 'correct',
    challenge: challenge.title,
    points: challenge.points,
  }
}
