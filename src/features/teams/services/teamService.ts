import 'server-only'

import { z } from 'zod'

import {
  createTeamRow,
  renameTeamRow,
  slugifyTeamName,
} from '@/features/teams/repositories/teamRepository'

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, 'Team name is required.').max(60),
})

export const renameTeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, 'Team name is required.').max(60),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type RenameTeamInput = z.infer<typeof renameTeamSchema>

export async function createTeam(input: CreateTeamInput) {
  const name = input.name.trim()
  return createTeamRow({ name, slug: slugifyTeamName(name) })
}

export async function renameTeam(input: RenameTeamInput) {
  const name = input.name.trim()
  await renameTeamRow(input.id, { name, slug: slugifyTeamName(name) })
}
