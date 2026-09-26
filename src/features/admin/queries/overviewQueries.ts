import 'server-only'

import { requireAdmin } from '@/features/admin/services/requireAdmin'
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
export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin()
  const supabase = createAdminClient()

  const [
    { count: playerCount, error: playersError },
    { count: teamCount, error: teamsError },
    { count: activeCount, error: challengesError },
    { count: solveCount, error: solvesError },
  ] = await Promise.all([
    supabase.from('players').select('id', { count: 'exact', head: true }),
    supabase.from('teams').select('id', { count: 'exact', head: true }),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('solves').select('id', { count: 'exact', head: true }),
  ])

  if (playersError || teamsError || challengesError || solvesError) {
    throw new Error('Unable to load admin overview.')
  }

  const leaderboards = await getLeaderboards()

  return {
    totalPlayers: playerCount ?? 0,
    totalTeams: teamCount ?? 0,
    activeChallenges: activeCount ?? 0,
    totalSolves: solveCount ?? 0,
    leaderboards,
  }
}
