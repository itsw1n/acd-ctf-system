import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { env } from '@/config/env'
import { createSessionToken, sha256 } from '@/lib/security/hash'
import {
  createSessionRecord,
  deleteSessionByTokenHash,
  getSessionPlayerId,
} from '@/features/sessions/repositories/sessionRepository'
import { getPlayerById } from '@/features/players/repositories/playerRepository'

const SESSION_DAYS = 3

export async function issuePlayerSession(playerId: string) {
  const rawToken = createSessionToken()
  const tokenHash = sha256(rawToken)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await createSessionRecord({
    playerId,
    tokenHash,
    expiresAt: expiresAt.toISOString(),
  })

  const store = await cookies()
  store.set(env.SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function getCurrentPlayer() {
  const store = await cookies()
  const rawToken = store.get(env.SESSION_COOKIE_NAME)?.value
  if (!rawToken) return null

  const playerId = await getSessionPlayerId(sha256(rawToken))
  if (!playerId) return null

  return getPlayerById(playerId)
}

export async function requireCurrentPlayer() {
  const player = await getCurrentPlayer()
  if (!player) redirect('/signin')
  return player
}

export async function clearCurrentSession() {
  const store = await cookies()
  const rawToken = store.get(env.SESSION_COOKIE_NAME)?.value

  if (rawToken) {
    await deleteSessionByTokenHash(sha256(rawToken))
  }

  store.delete(env.SESSION_COOKIE_NAME)
}
