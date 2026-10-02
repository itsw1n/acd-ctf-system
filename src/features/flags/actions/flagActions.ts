'use server'

import { revalidatePath } from 'next/cache'
import { flagSchema } from '@/features/flags/schemas/flagSchema'
import { submitFlagForPlayer } from '@/features/flags/services/submitFlag'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'
import { requireRoomMemberById } from '@/features/rooms/services/requireRoom'
import { checkAuthRateLimit, RATE_LIMITED } from '@/lib/security/rateLimit'

export type FlagState = {
  status?: 'correct' | 'duplicate' | 'incorrect' | 'error'
  message?: string
}

export async function submitFlagAction(
  roomId: string,
  _previous: FlagState,
  formData: FormData
): Promise<FlagState> {
  const player = await requireCurrentPlayer()

  // Room owners cannot play their own room: their solves would contaminate
  // team scores, totals, and statistics. Enforced here at the only
  // submission entry point; the membership role is DB-derived, never client
  // input. Non-members are bounced to the join page by the guard.
  const { membership } = await requireRoomMemberById(roomId)
  if (membership.role !== 'PARTICIPANT') {
    return { status: 'error', message: 'Only room participants can submit competition flags.' }
  }

  const parsed = flagSchema.safeParse({ flag: formData.get('flag') })

  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid flag.' }
  }

  try {
    await checkAuthRateLimit(`flag:${player.id}`, { limit: 30, windowMs: 60_000 })
  } catch (error) {
    if (error instanceof Error && error.message === RATE_LIMITED) {
      return { status: 'error', message: 'Too many attempts. Try again in a minute.' }
    }
    throw error
  }

  try {
    const result = await submitFlagForPlayer(player.id, roomId, parsed.data.flag)

    if (result.status === 'incorrect') {
      return { status: 'incorrect', message: 'Flag rejected. Check the value and try again.' }
    }

    if (result.status === 'duplicate') {
      return {
        status: 'duplicate',
        message: `Already solved: ${result.challenge}. No additional points awarded.`,
      }
    }

    revalidatePath('/challenges')
    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    revalidatePath('/activity')

    return {
      status: 'correct',
      message: `Flag accepted — ${result.challenge} +${result.points} PTS`,
    }
  } catch {
    return { status: 'error', message: 'Unable to submit the flag right now.' }
  }
}
