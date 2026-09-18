import 'server-only'

import { requireAdmin } from '@/features/admin/services/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminTeamStats = {
  id: string
  name: string
  slug: string
  memberCount: number
  score: number
}

export async function listTeamsWithStats(): Promise<AdminTeamStats[]> {
  await requireAdmin()
  const supabase = createAdminClient()

  const [{ data: teams, error: teamsError }, { data: players, error: playersError }] =
    await Promise.all([
      supabase.from('teams').select('id,name,slug').order('name'),
      // role is selected so member counts explicitly cover PLAYER accounts;
      // teamless ADMINs are never members of any team.
      supabase.from('players').select('id,team_id,role'),
    ])

  if (teamsError || playersError) throw new Error('Unable to load teams.')

  const competitors = (players ?? []).filter(
    (player) => player.role === 'PLAYER' && player.team_id !== null
  )
  const playerTeamById = new Map(competitors.map((player) => [player.id, player.team_id]))
  const memberCountByTeam = new Map<string, number>()
  for (const player of competitors) {
    memberCountByTeam.set(player.team_id, (memberCountByTeam.get(player.team_id) ?? 0) + 1)
  }

  const { data: solves, error: solvesError } = await supabase
    .from('solves')
    .select('player_id,points_awarded')
  if (solvesError) throw new Error('Unable to load team scores.')

  const scoreByTeam = new Map<string, number>()
  for (const solve of solves ?? []) {
    const teamId = playerTeamById.get(solve.player_id)
    // Solves by teamless ADMINs (or unknown players) belong to no team.
    if (!teamId) continue
    scoreByTeam.set(teamId, (scoreByTeam.get(teamId) ?? 0) + solve.points_awarded)
  }

  return (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    memberCount: memberCountByTeam.get(team.id) ?? 0,
    score: scoreByTeam.get(team.id) ?? 0,
  }))
}
