import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type PlayerRank = {
  playerId: string
  alias: string
  team: string
  points: number
}

export type TeamRank = {
  teamId: string
  team: string
  points: number
}

export async function getLeaderboards() {
  const supabase = createAdminClient()

  const [
    { data: teams, error: teamsError },
    { data: players, error: playersError },
    { data: solves, error: solvesError },
  ] = await Promise.all([
    supabase.from('teams').select('id,name'),
    supabase.from('players').select('id,alias,team_id'),
    supabase.from('solves').select('player_id,points_awarded'),
  ])

  if (teamsError || playersError || solvesError) {
    throw new Error('Unable to load leaderboard.')
  }

  const teamById = new Map((teams ?? []).map((team) => [team.id, team.name]))
  const playerById = new Map((players ?? []).map((player) => [player.id, player]))
  const playerPoints = new Map<string, number>()

  for (const solve of solves ?? []) {
    playerPoints.set(
      solve.player_id,
      (playerPoints.get(solve.player_id) ?? 0) + solve.points_awarded
    )
  }

  const playerRanks: PlayerRank[] = (players ?? [])
    .map((player) => ({
      playerId: player.id,
      alias: player.alias,
      team: teamById.get(player.team_id) ?? 'Unknown',
      points: playerPoints.get(player.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || a.alias.localeCompare(b.alias))

  const teamPoints = new Map<string, number>()
  for (const rank of playerRanks) {
    const player = playerById.get(rank.playerId)
    if (!player) continue
    teamPoints.set(player.team_id, (teamPoints.get(player.team_id) ?? 0) + rank.points)
  }

  const teamRanks: TeamRank[] = (teams ?? [])
    .map((team) => ({
      teamId: team.id,
      team: team.name,
      points: teamPoints.get(team.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || a.team.localeCompare(b.team))

  return { playerRanks, teamRanks }
}
