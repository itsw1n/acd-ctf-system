import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type PlayerRank = {
  playerId: string
  alias: string
  team: string
  points: number
  scoreReachedAt: string | null
}

export type TeamRank = {
  teamId: string
  team: string
  points: number
}

export async function getLeaderboards(roomId: string) {
  const supabase = createAdminClient()

  const [
    { data: teams, error: teamsError },
    { data: memberships, error: membershipsError },
    { data: solves, error: solvesError },
  ] = await Promise.all([
    supabase.from('teams').select('id,name').eq('room_id', roomId),
    // Competitors only: teamless OWNERs must not appear on the player
    // board nor leak points into team totals.
    supabase.from('room_memberships').select('player_id,team_id,role').eq('room_id', roomId),
    supabase.from('solves').select('player_id,points_awarded,solved_at').eq('room_id', roomId),
  ])

  if (teamsError || membershipsError || solvesError) {
    throw new Error('Unable to load leaderboard.')
  }

  const competitors = (memberships ?? []).filter(
    (membership) => membership.role === 'PARTICIPANT' && membership.team_id !== null
  )
  const memberIds = [...new Set((memberships ?? []).map((membership) => membership.player_id))]

  const { data: players, error: playersError } = memberIds.length
    ? await supabase.from('players').select('id,alias').in('id', memberIds)
    : { data: [], error: null }
  if (playersError) throw new Error('Unable to load leaderboard.')

  const teamById = new Map((teams ?? []).map((team) => [team.id, team.name]))
  const aliasById = new Map((players ?? []).map((player) => [player.id, player.alias]))
  const teamByPlayerId = new Map(competitors.map((player) => [player.player_id, player.team_id]))
  const playerPoints = new Map<string, number>()
  const playerLastSolveAt = new Map<string, string>()

  for (const solve of solves ?? []) {
    if (!teamByPlayerId.has(solve.player_id)) continue
    playerPoints.set(
      solve.player_id,
      (playerPoints.get(solve.player_id) ?? 0) + solve.points_awarded
    )
    const previousSolveAt = playerLastSolveAt.get(solve.player_id)
    if (!previousSolveAt || solve.solved_at > previousSolveAt) {
      playerLastSolveAt.set(solve.player_id, solve.solved_at)
    }
  }

  const playerRanks: PlayerRank[] = competitors
    .map((player) => ({
      playerId: player.player_id,
      alias: aliasById.get(player.player_id) ?? 'Unknown',
      team: teamById.get(player.team_id) ?? 'Unknown',
      points: playerPoints.get(player.player_id) ?? 0,
      scoreReachedAt: playerLastSolveAt.get(player.player_id) ?? null,
    }))
    .sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.scoreReachedAt && b.scoreReachedAt && a.scoreReachedAt !== b.scoreReachedAt) {
        return a.scoreReachedAt.localeCompare(b.scoreReachedAt)
      }
      if (a.scoreReachedAt !== b.scoreReachedAt) return a.scoreReachedAt ? -1 : 1
      // Equal points and solve times are a true tie; preserve database order.
      return 0
    })

  const teamPoints = new Map<string, number>()
  for (const rank of playerRanks) {
    const teamId = teamByPlayerId.get(rank.playerId)
    // Defensive: a teamless row must never create a null-bucket entry.
    if (!teamId) continue
    teamPoints.set(teamId, (teamPoints.get(teamId) ?? 0) + rank.points)
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
