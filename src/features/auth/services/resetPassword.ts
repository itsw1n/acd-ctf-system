import 'server-only'
import { hashPassword, sha256, verifyPassword } from '@/lib/security/hash'
import {
  getPlayerByAlias,
  updatePlayerPassword,
  verifyRecoveryCode,
} from '@/features/players/repositories/playerRepository'
import { deleteAllSessionsForPlayer } from '@/features/sessions/repositories/sessionRepository'

export async function resetPassword(input: {
  alias: string
  recoveryCode: string
  newPassword: string
}): Promise<void> {
  const player = await getPlayerByAlias(input.alias)
  const exact = player && player.alias.toLowerCase() === input.alias.toLowerCase() ? player : null

  // Same timing-equalization as signin: the hash comparison query always runs,
  // even for unknown aliases (against a nil UUID that matches nothing).
  const targetId = exact?.id ?? '00000000-0000-0000-0000-000000000000'
  const codeValid = await verifyRecoveryCode(targetId, sha256(input.recoveryCode.toUpperCase()))
  if (!exact || !codeValid) throw new Error('INVALID_RECOVERY')

  await updatePlayerPassword(exact.id, await hashPassword(input.newPassword))

  // Old sessions must not survive a password reset.
  await deleteAllSessionsForPlayer(exact.id)
}
