import 'server-only'
import { verifyPassword } from '@/lib/security/hash'
import { getPlayerCredentialsByAlias } from '@/features/players/repositories/playerRepository'
import { issuePlayerSession } from '@/features/sessions/services/sessionService'
import type { PlayerRole } from '@/features/players/types'

// Pre-generated Argon2id hash of a random string. Verified against when the
// alias does not exist (or has no password yet) so unknown aliases cost the
// same as a real check and reveal nothing through timing.
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$vl2uaQaIhTAiA1cpL9UP0g$A34cRr5WOztZr9zti1UuiM8GcZ700uyxq0GchOY7WNE'

export async function signIn(input: { alias: string; password: string }): Promise<PlayerRole> {
  const credentials = await getPlayerCredentialsByAlias(input.alias)

  // Exact case-insensitive match: ilike treats `_` as a wildcard, so confirm
  // in code against the unique lower(alias) index semantics.
  const exact =
    credentials && credentials.alias.toLowerCase() === input.alias.toLowerCase()
      ? credentials
      : null

  const hash = exact?.password_hash ?? DUMMY_HASH
  const known = Boolean(exact?.password_hash)
  const valid = known && (await verifyPassword(hash, input.password))
  if (!exact || !valid) throw new Error('INVALID_CREDENTIALS')

  await issuePlayerSession(exact.id)
  return exact.role
}
