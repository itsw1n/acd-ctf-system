import 'server-only'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLeaderboards } from '@/features/leaderboard/queries/leaderboardQueries'

export type AdminOverview = {
  totalPlayers: number
  totalTeams: number
  activeChallenges: number
  totalSolves: number
  leaderboards: Awaited<ReturnType<typeof getLeaderboards>>
}

/**
 * Cross-feature admin overview composition only. Owned reads stay in
 * players/teams/challenges/solves features.
 */
export async function getAdminOverview(roomId: string): Promise<AdminOverview> {
  await requireRoomOwnerById(roomId)
  const supabase = createAdminClient()
  const room = { id: roomId }

  const [
    { count: playerCount, error: playersError },
    { count: teamCount, error: teamsError },
    { count: activeCount, error: challengesError },
    { count: solveCount, error: solvesError },
  ] = await Promise.all([
    supabase
      .from('room_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id),
    supabase.from('teams').select('id', { count: 'exact', head: true }).eq('room_id', room.id),
    supabase
      .from('challenges')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('active', true),
    supabase.from('solves').select('id', { count: 'exact', head: true }).eq('room_id', room.id),
  ])

  if (playersError || teamsError || challengesError || solvesError) {
    throw new Error('Unable to load admin overview.')
  }

  const leaderboards = await getLeaderboards(room.id)

  return {
    totalPlayers: playerCount ?? 0,
    totalTeams: teamCount ?? 0,
    activeChallenges: activeCount ?? 0,
    totalSolves: solveCount ?? 0,
    leaderboards,
  }
}
