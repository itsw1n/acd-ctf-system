import 'server-only'

import { requireAdmin } from '@/features/auth/services/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminSolveRow = {
  id: string
  playerAlias: string
  fullName: string
  team: string
  challenge: string
  category: string
  pointsAwarded: number
  solvedAt: string
}

/**
 * Read-only solve list for operators. No score editing here.
 */
export async function listSolvesForAdmin(input?: {
  search?: string
  teamId?: string
  category?: string
}): Promise<AdminSolveRow[]> {
  await requireAdmin()
  const supabase = createAdminClient()
  const search = input?.search?.trim() ?? ''
  const teamId = input?.teamId?.trim() ?? ''
  const category = input?.category?.trim() ?? ''

  const { data: solves, error } = await supabase
    .from('solves')
    .select('id,player_id,challenge_id,points_awarded,solved_at')
    .order('solved_at', { ascending: false })
    .limit(300)

  if (error) throw new Error(`Unable to load solves: ${error.message}`)
  if (!solves?.length) return []

  const playerIds = [...new Set(solves.map((solve) => solve.player_id))]
  const challengeIds = [...new Set(solves.map((solve) => solve.challenge_id))]

  const [{ data: players, error: playersError }, { data: challenges, error: challengesError }] =
    await Promise.all([
      supabase.from('players').select('id,alias,full_name,team_id').in('id', playerIds),
      supabase.from('challenges').select('id,title,category').in('id', challengeIds),
    ])

  if (playersError || challengesError) throw new Error('Unable to load solve details.')

  const { data: teams, error: teamsError } = await supabase.from('teams').select('id,name')
  if (teamsError) throw new Error('Unable to load solve teams.')

  const playerById = new Map((players ?? []).map((player) => [player.id, player]))
  const challengeById = new Map((challenges ?? []).map((challenge) => [challenge.id, challenge]))
  const teamById = new Map((teams ?? []).map((team) => [team.id, team.name]))

  let rows: AdminSolveRow[] = solves.map((solve) => {
    const player = playerById.get(solve.player_id)
    const challenge = challengeById.get(solve.challenge_id)
    return {
      id: solve.id,
      playerAlias: player?.alias ?? 'Unknown',
      fullName: player?.full_name ?? 'Unknown',
      team: (player?.team_id ? teamById.get(player.team_id) : undefined) ?? '—',
      challenge: challenge?.title ?? 'Unknown challenge',
      category: challenge?.category ?? 'Unknown',
      pointsAwarded: solve.points_awarded,
      solvedAt: solve.solved_at,
    }
  })

  if (teamId) {
    const allowedPlayerIds = new Set(
      (players ?? []).filter((player) => player.team_id === teamId).map((player) => player.id)
    )
    rows = rows.filter((_, index) => allowedPlayerIds.has(solves[index].player_id))
  }

  if (category) {
    rows = rows.filter((row) => row.category.toLowerCase() === category.toLowerCase())
  }

  if (search) {
    const needle = search.toLowerCase()
    rows = rows.filter(
      (row) =>
        row.playerAlias.toLowerCase().includes(needle) ||
        row.fullName.toLowerCase().includes(needle) ||
        row.challenge.toLowerCase().includes(needle)
    )
  }

  return rows
}

/** Category choices must remain available when the current result set is empty. */
export async function listSolveCategoriesForAdmin(): Promise<string[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient().from('challenges').select('category')
  if (error) throw new Error('Unable to load solve categories.')
  return [...new Set((data ?? []).map((challenge) => challenge.category))].sort()
}
