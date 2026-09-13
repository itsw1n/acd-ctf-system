import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export type AdminTeamStats = {
  id: string
  name: string
  slug: string
  memberCount: number
  score: number
}

export async function listTeamsWithStats(): Promise<AdminTeamStats[]> {
  const supabase = createAdminClient()

  const [{ data: teams, error: teamsError }, { data: players, error: playersError }] =
    await Promise.all([
      supabase.from('teams').select('id,name,slug').order('name'),
      supabase.from('players').select('id,team_id'),
    ])

  if (teamsError || playersError) throw new Error('Unable to load teams.')

  const playerTeamById = new Map((players ?? []).map((player) => [player.id, player.team_id]))
  const memberCountByTeam = new Map<string, number>()
  for (const player of players ?? []) {
    memberCountByTeam.set(player.team_id, (memberCountByTeam.get(player.team_id) ?? 0) + 1)
  }

  const { data: solves, error: solvesError } = await supabase
    .from('solves')
    .select('player_id,points_awarded')
  if (solvesError) throw new Error('Unable to load team scores.')

  const scoreByTeam = new Map<string, number>()
  for (const solve of solves ?? []) {
    const teamId = playerTeamById.get(solve.player_id)
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
