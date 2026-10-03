import 'server-only'
import { createRecoveryCode, hashPassword, sha256 } from '@/lib/security/hash'
import { createPlayer, verifyRecoveryCode } from '@/features/players/repositories/playerRepository'
import { issuePlayerSession } from '@/features/sessions/services/sessionService'

export type SignUpResult = { recoveryCode: string; alias: string; playerId: string }

export async function signUp(input: {
  fullName: string
  alias: string
  password: string
}): Promise<SignUpResult> {
  // Teamless by design: teams are chosen per room at join time, so signup
  // creates a bare account. Extra input fields never reach the repository.
  const recoveryCode = createRecoveryCode()
  const playerId = await createPlayer({
    fullName: input.fullName,
    alias: input.alias,
    passwordHash: await hashPassword(input.password),
    recoveryCodeHash: sha256(recoveryCode.toUpperCase()),
  })

  // No session here on purpose: issuing the session cookie inside this action
  // makes Next.js reload the route and drops the one-time recovery-code state.
  // The session is issued by continueAfterSignup once the user saves the code.
  return { recoveryCode, alias: input.alias, playerId }
}

/**
 * Second half of signup. Proves knowledge of the just-issued recovery code
 * (verified against its stored hash) before creating the first session, so a
 * bare playerId can never be exchanged for access.
 */
export async function continueAfterSignup(input: {
  playerId: string
  recoveryCode: string
}): Promise<void> {
  const valid = await verifyRecoveryCode(input.playerId, sha256(input.recoveryCode.toUpperCase()))
  if (!valid) throw new Error('INVALID_RECOVERY')

  await issuePlayerSession(input.playerId)
}
