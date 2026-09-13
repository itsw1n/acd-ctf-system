import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Player, PlayerRole, Team } from '@/features/players/types'

type PlayerRow = {
  id: string
  full_name: string
  alias: string
  team_id: string
  role: PlayerRole
}

type PlayerCredentialsRow = {
  id: string
  alias: string
  password_hash: string | null
}

type TeamRow = {
  id: string
  name: string
  slug: string
}

export async function listTeams(): Promise<Team[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('teams').select('id,name,slug').order('name')

  if (error) throw new Error(`Unable to load teams: ${error.message}`)
  return (data ?? []) as Team[]
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('teams')
    .select('id,name,slug')
    .eq('id', teamId)
    .maybeSingle()

  if (error) throw new Error(`Unable to load team: ${error.message}`)
  return (data as TeamRow | null) ?? null
}

export async function getPlayerByAlias(alias: string): Promise<PlayerRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .select('id,full_name,alias,team_id')
    .ilike('alias', alias)
    .maybeSingle()

  if (error) throw new Error(`Unable to find player: ${error.message}`)
  return (data as PlayerRow | null) ?? null
}

export async function getPlayerById(playerId: string): Promise<Player | null> {
  const supabase = createAdminClient()

  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('id,full_name,alias,team_id,role')
    .eq('id', playerId)
    .maybeSingle()

  if (playerError) throw new Error(`Unable to load player: ${playerError.message}`)
  if (!player) return null

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id,name,slug')
    .eq('id', player.team_id)
    .single()

  if (teamError) throw new Error(`Unable to load player team: ${teamError.message}`)

  return {
    id: player.id,
    fullName: player.full_name,
    alias: player.alias,
    role: (player as PlayerRow).role,
    team: team as TeamRow,
  }
}

export async function createPlayer(input: {
  fullName: string
  alias: string
  teamId: string
  passwordHash: string
  recoveryCodeHash: string
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .insert({
      full_name: input.fullName,
      alias: input.alias,
      team_id: input.teamId,
      // Role is forced server-side. Never accept it from client input.
      role: 'PLAYER',
      password_hash: input.passwordHash,
      recovery_code_hash: input.recoveryCodeHash,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('ALIAS_TAKEN')
    }
    throw new Error(`Unable to create player: ${error.message}`)
  }

  return data.id as string
}

/** Returns id + password hash for signin. The hash must never reach the client. */
export async function getPlayerCredentialsByAlias(
  alias: string
): Promise<PlayerCredentialsRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .select('id,alias,password_hash')
    .ilike('alias', alias)
    .maybeSingle()

  if (error) throw new Error(`Unable to find player: ${error.message}`)
  return (data as PlayerCredentialsRow | null) ?? null
}

export async function updatePlayerPassword(playerId: string, passwordHash: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('players')
    .update({ password_hash: passwordHash })
    .eq('id', playerId)

  if (error) throw new Error(`Unable to update password: ${error.message}`)
}

export async function verifyRecoveryCode(playerId: string, recoveryCodeHash: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .select('id')
    .eq('id', playerId)
    .eq('recovery_code_hash', recoveryCodeHash)
    .maybeSingle()

  if (error) throw new Error(`Unable to verify recovery code: ${error.message}`)
  return Boolean(data)
}
