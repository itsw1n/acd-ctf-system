'use server'

import { redirect } from 'next/navigation'
import { joinSchema, recoverSchema } from '@/features/players/schemas/playerSchemas'
import {
  createPlayer,
  getPlayerByAlias,
  getTeamById,
  verifyRecoveryCode,
} from '@/features/players/repositories/playerRepository'
import {
  issuePlayerSession,
  clearCurrentSession,
} from '@/features/sessions/services/sessionService'
import { createRecoveryCode, sha256 } from '@/lib/security/hash'

export type JoinState = {
  error?: string
  recoveryCode?: string
  alias?: string
}

export async function joinPlayer(_previous: JoinState, formData: FormData): Promise<JoinState> {
  const parsed = joinSchema.safeParse({
    teamId: formData.get('teamId'),
    fullName: formData.get('fullName'),
    alias: formData.get('alias'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your registration details.' }
  }

  const team = await getTeamById(parsed.data.teamId)
  if (!team) return { error: 'Selected team does not exist.' }

  const recoveryCode = createRecoveryCode()

  try {
    const playerId = await createPlayer({
      ...parsed.data,
      recoveryCodeHash: sha256(recoveryCode.toUpperCase()),
    })

    await issuePlayerSession(playerId)

    return {
      recoveryCode,
      alias: parsed.data.alias,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'ALIAS_TAKEN') {
      return { error: 'That alias is already taken. Choose another hacker tag.' }
    }
    return { error: 'Registration failed. Please try again.' }
  }
}

export type RecoverState = {
  error?: string
  recovered?: boolean
}

export async function recoverPlayer(
  _previous: RecoverState,
  formData: FormData
): Promise<RecoverState> {
  const parsed = recoverSchema.safeParse({
    alias: formData.get('alias'),
    recoveryCode: formData.get('recoveryCode'),
  })

  if (!parsed.success) {
    return { error: 'Enter your alias and recovery code.' }
  }

  const player = await getPlayerByAlias(parsed.data.alias)
  if (!player) return { error: 'Alias or recovery code is incorrect.' }

  const valid = await verifyRecoveryCode(player.id, sha256(parsed.data.recoveryCode.toUpperCase()))

  if (!valid) return { error: 'Alias or recovery code is incorrect.' }

  await issuePlayerSession(player.id)
  return { recovered: true }
}

export async function logoutPlayer() {
  await clearCurrentSession()
  redirect('/')
}
