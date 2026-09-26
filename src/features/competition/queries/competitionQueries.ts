import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getCompetitionStatus() {
  const supabase = createAdminClient()
  const [settings, challenges, solves, players, teams] = await Promise.all([
    supabase.from('competition_settings').select('signups_locked').eq('id', true).single(),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('solves').select('id', { count: 'exact', head: true }),
    supabase.from('players').select('id', { count: 'exact', head: true }).eq('role', 'PLAYER'),
    supabase.from('teams').select('id', { count: 'exact', head: true }),
  ])
  if (settings.error || challenges.error || solves.error || players.error || teams.error) {
    throw new Error('Unable to load competition status.')
  }
  return {
    locked: settings.data.signups_locked,
    activeChallenges: challenges.count ?? 0,
    solves: solves.count ?? 0,
    players: players.count ?? 0,
    teams: teams.count ?? 0,
  }
}
