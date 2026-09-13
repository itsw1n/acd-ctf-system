'use server'

import { revalidatePath } from 'next/cache'
import { flagSchema } from '@/features/flags/schemas/flagSchema'
import { submitFlagForPlayer } from '@/features/flags/services/submitFlag'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

export type FlagState = {
  status?: 'correct' | 'duplicate' | 'incorrect' | 'error'
  message?: string
}

export async function submitFlagAction(
  _previous: FlagState,
  formData: FormData
): Promise<FlagState> {
  const player = await requireCurrentPlayer()
  const parsed = flagSchema.safeParse({ flag: formData.get('flag') })

  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid flag.' }
  }

  try {
    const result = await submitFlagForPlayer(player.id, parsed.data.flag)

    if (result.status === 'incorrect') {
      return { status: 'incorrect', message: 'Flag rejected. Check the value and try again.' }
    }

    if (result.status === 'duplicate') {
      return {
        status: 'duplicate',
        message: `Already solved: ${result.challenge}. No additional points awarded.`,
      }
    }

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
