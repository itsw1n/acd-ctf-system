import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createSessionRecord(input: {
  playerId: string
  tokenHash: string
  expiresAt: string
}) {
  const supabase = createAdminClient()
  // last_seen_at is written once here at creation and never updated on reads,
  // so session validation performs no per-request writes.
  const { error } = await supabase.from('player_sessions').insert({
    player_id: input.playerId,
    token_hash: input.tokenHash,
    expires_at: input.expiresAt,
    last_seen_at: new Date().toISOString(),
  })

  if (error) throw new Error(`Unable to create session: ${error.message}`)
}

export async function getSessionPlayerId(tokenHash: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('player_sessions')
    .select('player_id,expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error) throw new Error(`Unable to read session: ${error.message}`)
  if (!data) return null
  if (new Date(data.expires_at).getTime() <= Date.now()) return null

  return data.player_id as string
}

export async function deleteSessionByTokenHash(tokenHash: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('player_sessions').delete().eq('token_hash', tokenHash)

  if (error) throw new Error(`Unable to remove session: ${error.message}`)
}

/** Revokes every session for a player (used after password reset). */
export async function deleteAllSessionsForPlayer(playerId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('player_sessions').delete().eq('player_id', playerId)

  if (error) throw new Error(`Unable to remove sessions: ${error.message}`)
}
