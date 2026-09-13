import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { PlayerRole } from '@/features/players/types'

export type AdminPlayerRow = {
  id: string
  fullName: string
  alias: string
  teamId: string
  team: string
  role: PlayerRole
  createdAt: string
}

/**
 * Read-only admin player list. Selects display fields only — never
 * password_hash, recovery_code_hash, or session material.
 */
export async function listPlayersForAdmin(input?: {
  search?: string
  teamId?: string
}): Promise<AdminPlayerRow[]> {
  const supabase = createAdminClient()
  const search = input?.search?.trim() ?? ''
  const teamId = input?.teamId?.trim() ?? ''

  let query = supabase
    .from('players')
    .select('id,full_name,alias,team_id,role,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (teamId) query = query.eq('team_id', teamId)
  if (search) query = query.or(`alias.ilike.%${search}%,full_name.ilike.%${search}%`)

  const { data: players, error } = await query
  if (error) throw new Error(`Unable to load players: ${error.message}`)
  if (!players?.length) return []

  const { data: teams, error: teamsError } = await supabase.from('teams').select('id,name')
  if (teamsError) throw new Error(`Unable to load teams: ${teamsError.message}`)
  const teamById = new Map((teams ?? []).map((team) => [team.id, team.name]))

  return players.map((player) => ({
    id: player.id,
    fullName: player.full_name,
    alias: player.alias,
    teamId: player.team_id,
    team: teamById.get(player.team_id) ?? 'Unknown',
    role: player.role as PlayerRole,
    createdAt: player.created_at,
  }))
}
