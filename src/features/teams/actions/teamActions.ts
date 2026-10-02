'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { getDefaultRoom } from '@/features/rooms/repositories/roomRepository'
import {
  createTeam,
  createTeamSchema,
  renameTeam,
  renameTeamSchema,
} from '@/features/teams/services/teamService'

export type TeamActionState = {
  error?: string
}

async function requireDefaultRoomOwner() {
  const room = await getDefaultRoom()
  await requireRoomOwnerById(room.id)
  return room
}

export async function createTeamAction(
  _previous: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const room = await requireDefaultRoomOwner()

  const parsed = createTeamSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the team name.' }
  }

  try {
    await createTeam(room.id, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'TEAM_TAKEN') {
      return { error: 'That team name is already taken.' }
    }
    return { error: 'Unable to create team. Please try again.' }
  }

  revalidatePath('/admin/teams')
  redirect('/admin/teams')
}

export async function renameTeamAction(
  _previous: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const room = await requireDefaultRoomOwner()

  const parsed = renameTeamSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the team name.' }
  }

  try {
    await renameTeam(room.id, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'TEAM_TAKEN') {
      return { error: 'That team name is already taken.' }
    }
    return { error: 'Unable to rename team. Please try again.' }
  }

  revalidatePath('/admin/teams')
  redirect('/admin/teams')
}
