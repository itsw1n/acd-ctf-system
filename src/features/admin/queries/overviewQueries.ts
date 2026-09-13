import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { listTeamsWithStats } from '@/features/teams/queries/teamAdminQueries'

export type AdminOverview = {
  totalPlayers: number
  totalTeams: number
  activeChallenges: number
  totalSolves: number
  leadingTeam: { name: string; points: number } | null
  recentSolves: Array<{
    id: string
    playerAlias: string
    challenge: string
    points: number
    solvedAt: string
  }>
}

/**
 * Cross-feature admin overview composition only. Owned reads stay in
 * players/teams/challenges/solves features.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
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

  const [teamStats, recent] = await Promise.all([
    listTeamsWithStats(),
    supabase
      .from('solves')
      .select('id,player_id,challenge_id,points_awarded,solved_at')
      .order('solved_at', { ascending: false })
      .limit(8),
  ])

  if (recent.error) throw new Error(`Unable to load recent solves: ${recent.error.message}`)

  const leading = [...teamStats].sort((a, b) => b.score - a.score)[0] ?? null

  const playerIds = [...new Set((recent.data ?? []).map((solve) => solve.player_id))]
  const challengeIds = [...new Set((recent.data ?? []).map((solve) => solve.challenge_id))]

  const [{ data: players }, { data: challenges }] = await Promise.all([
    playerIds.length
      ? supabase.from('players').select('id,alias').in('id', playerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; alias: string }> }),
    challengeIds.length
      ? supabase.from('challenges').select('id,title').in('id', challengeIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
  ])

  const aliasById = new Map((players ?? []).map((player) => [player.id, player.alias]))
  const titleById = new Map((challenges ?? []).map((challenge) => [challenge.id, challenge.title]))

  return {
    totalPlayers: playerCount ?? 0,
    totalTeams: teamCount ?? 0,
    activeChallenges: activeCount ?? 0,
    totalSolves: solveCount ?? 0,
    leadingTeam: leading ? { name: leading.name, points: leading.score } : null,
    recentSolves: (recent.data ?? []).map((solve) => ({
      id: solve.id,
      playerAlias: aliasById.get(solve.player_id) ?? 'Unknown',
      challenge: titleById.get(solve.challenge_id) ?? 'Unknown challenge',
      points: solve.points_awarded,
      solvedAt: solve.solved_at,
    })),
  }
}
