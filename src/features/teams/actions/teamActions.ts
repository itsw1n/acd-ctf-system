'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { getRoomPath } from '@/features/rooms/services/roomService'
import {
  createTeam,
  createTeamSchema,
  renameTeam,
  renameTeamSchema,
} from '@/features/teams/services/teamService'

export type TeamActionState = {
  error?: string
}

export async function createTeamAction(
  roomId: string,
  _previous: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  await requireRoomOwnerById(roomId)

  const parsed = createTeamSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the team name.' }
  }

  try {
    await createTeam(roomId, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'TEAM_TAKEN') {
      return { error: 'That team name is already taken.' }
    }
    return { error: 'Unable to create team. Please try again.' }
  }

  const path = `${await getRoomPath(roomId)}/admin/teams`
  revalidatePath(path)
  redirect(path)
}

export async function renameTeamAction(
  roomId: string,
  _previous: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  await requireRoomOwnerById(roomId)

  const parsed = renameTeamSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the team name.' }
  }

  try {
    await renameTeam(roomId, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'TEAM_TAKEN') {
      return { error: 'That team name is already taken.' }
    }
    return { error: 'Unable to rename team. Please try again.' }
  }

  const path = `${await getRoomPath(roomId)}/admin/teams`
  revalidatePath(path)
  redirect(path)
}
