import 'server-only'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RoomMembershipRole } from '@/features/rooms/types'

export type AdminPlayerRow = {
  id: string
  fullName: string
  alias: string
  teamId: string | null
  team: string
  role: RoomMembershipRole
  accessLocked: boolean
  createdAt: string
}

/**
 * Read-only admin player list. Selects display fields only — never
 * password_hash, recovery_code_hash, or session material. Team, role, and
 * lock state come from the room membership, not the account row.
 */
export async function listPlayersForAdmin(
  roomId: string,
  input?: {
    search?: string
    teamId?: string
  }
): Promise<AdminPlayerRow[]> {
  await requireRoomOwnerById(roomId)
  const supabase = createAdminClient()
  const search = input?.search?.trim() ?? ''
  const teamId = input?.teamId?.trim() ?? ''

  let membershipsQuery = supabase
    .from('room_memberships')
    .select('player_id,team_id,role,access_locked')
    .eq('room_id', roomId)
  if (teamId) membershipsQuery = membershipsQuery.eq('team_id', teamId)

  const { data: memberships, error: membershipsError } = await membershipsQuery
  if (membershipsError) throw new Error(`Unable to load players: ${membershipsError.message}`)
  if (!memberships?.length) return []

  const memberIds = [...new Set(memberships.map((membership) => membership.player_id))]

  let playersQuery = supabase
    .from('players')
    .select('id,full_name,alias,created_at')
    .in('id', memberIds)
  if (search) {
    playersQuery = playersQuery.or(`alias.ilike.%${search}%,full_name.ilike.%${search}%`)
  }
  const { data: players, error: playersError } = await playersQuery
    .order('created_at', { ascending: false })
    .limit(200)
  if (playersError) throw new Error(`Unable to load players: ${playersError.message}`)
  if (!players?.length) return []

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id,name')
    .eq('room_id', roomId)
  if (teamsError) throw new Error(`Unable to load teams: ${teamsError.message}`)
  const teamById = new Map((teams ?? []).map((team) => [team.id, team.name]))
  const membershipByPlayerId = new Map(
    (memberships ?? []).map((membership) => [membership.player_id, membership])
  )

  return (players ?? []).map((player) => {
    const membership = membershipByPlayerId.get(player.id)
    return {
      id: player.id,
      fullName: player.full_name,
      alias: player.alias,
      teamId: membership?.team_id ?? null,
      // Teamless OWNERs have no team; '—' marks the absence explicitly.
      team: membership?.team_id ? (teamById.get(membership.team_id) ?? 'Unknown') : '—',
      role: (membership?.role ?? 'PARTICIPANT') as RoomMembershipRole,
      accessLocked: membership?.access_locked ?? false,
      createdAt: player.created_at,
    }
  })
}
