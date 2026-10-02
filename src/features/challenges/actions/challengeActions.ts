'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { getRoomPath } from '@/features/rooms/services/roomService'
import {
  createChallengeSchema,
  toggleChallengeActiveSchema,
  updateChallengeSchema,
} from '@/features/challenges/schemas/challengeSchemas'
import { createChallenge, updateChallenge } from '@/features/challenges/services/challengeService'
import { setChallengeActive } from '@/features/challenges/repositories/challengeRepository'

export type ChallengeActionState = {
  error?: string
}

function formValues(formData: FormData) {
  return {
    id: formData.get('id'),
    title: formData.get('title'),
    author: formData.get('author'),
    category: formData.get('category'),
    description: formData.get('description'),
    type: formData.get('type'),
    difficulty: formData.get('difficulty'),
    hint: formData.get('hint'),
    points: formData.get('points'),
    flag: formData.get('flag'),
    externalUrl: formData.get('externalUrl'),
    active: formData.get('active'),
  }
}

export async function createChallengeAction(
  roomId: string,
  _previous: ChallengeActionState,
  formData: FormData
): Promise<ChallengeActionState> {
  await requireRoomOwnerById(roomId)

  const parsed = createChallengeSchema.safeParse(formValues(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the challenge details.' }
  }

  try {
    await createChallenge(roomId, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'FLAG_IN_USE') {
      return { error: 'That flag is already used by another challenge.' }
    }
    return { error: 'Unable to create challenge. Please try again.' }
  }

  const path = `${await getRoomPath(roomId)}/admin/challenges`
  revalidatePath(path)
  redirect(path)
}

export async function updateChallengeAction(
  roomId: string,
  _previous: ChallengeActionState,
  formData: FormData
): Promise<ChallengeActionState> {
  await requireRoomOwnerById(roomId)

  const parsed = updateChallengeSchema.safeParse(formValues(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the challenge details.' }
  }

  try {
    await updateChallenge(roomId, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'FLAG_IN_USE') {
      return { error: 'That flag is already used by another challenge.' }
    }
    if (error instanceof Error && error.message === 'CHALLENGE_NOT_FOUND') {
      return { error: 'Challenge not found.' }
    }
    return { error: 'Unable to update challenge. Please try again.' }
  }

  const path = `${await getRoomPath(roomId)}/admin/challenges`
  revalidatePath(path)
  redirect(path)
}

export async function toggleChallengeActiveAction(roomId: string, formData: FormData) {
  await requireRoomOwnerById(roomId)

  const parsed = toggleChallengeActiveSchema.safeParse({
    id: formData.get('id'),
    active: formData.get('active'),
  })
  if (!parsed.success) return

  await setChallengeActive(parsed.data.id, roomId, parsed.data.active)
  revalidatePath(await getRoomPath(roomId))
}
