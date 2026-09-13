import 'server-only'
import { createRecoveryCode, hashPassword, sha256 } from '@/lib/security/hash'
import { createPlayer, getTeamById } from '@/features/players/repositories/playerRepository'
import { issuePlayerSession } from '@/features/sessions/services/sessionService'

export type SignUpResult = { recoveryCode: string; alias: string }

export async function signUp(input: {
  teamId: string
  fullName: string
  alias: string
  password: string
}): Promise<SignUpResult> {
  const team = await getTeamById(input.teamId)
  if (!team) throw new Error('TEAM_NOT_FOUND')

  const recoveryCode = createRecoveryCode()
  const playerId = await createPlayer({
    fullName: input.fullName,
    alias: input.alias,
    teamId: input.teamId,
    passwordHash: await hashPassword(input.password),
    recoveryCodeHash: sha256(recoveryCode.toUpperCase()),
  })

  await issuePlayerSession(playerId)

  return { recoveryCode, alias: input.alias }
}
