'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/features/admin/services/requireAdmin'
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
  _previous: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  await requireAdmin()

  const parsed = createTeamSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the team name.' }
  }

  try {
    await createTeam(parsed.data)
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
  await requireAdmin()

  const parsed = renameTeamSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the team name.' }
  }

  try {
    await renameTeam(parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'TEAM_TAKEN') {
      return { error: 'That team name is already taken.' }
    }
    return { error: 'Unable to rename team. Please try again.' }
  }

  revalidatePath('/admin/teams')
  redirect('/admin/teams')
}
