'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/features/admin/services/requireAdmin'
import { setPlayerAccessLocked } from '@/features/players/repositories/playerRepository'
import { deleteAllSessionsForPlayer } from '@/features/sessions/repositories/sessionRepository'

const playerAccessSchema = z.object({
  playerId: z.string().uuid(),
  locked: z.enum(['true', 'false']),
})

export async function setPlayerAccessAction(formData: FormData) {
  await requireAdmin()
  const parsed = playerAccessSchema.safeParse({
    playerId: formData.get('playerId'),
    locked: formData.get('locked'),
  })
  if (!parsed.success) return

  const locked = parsed.data.locked === 'true'
  await setPlayerAccessLocked(parsed.data.playerId, locked)
  if (locked) await deleteAllSessionsForPlayer(parsed.data.playerId)
  revalidatePath('/admin/players')
}
