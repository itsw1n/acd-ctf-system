'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { getDefaultRoom } from '@/features/rooms/repositories/roomRepository'
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

async function requireDefaultRoomOwner() {
  const room = await getDefaultRoom()
  await requireRoomOwnerById(room.id)
  return room
}

export async function createChallengeAction(
  _previous: ChallengeActionState,
  formData: FormData
): Promise<ChallengeActionState> {
  const room = await requireDefaultRoomOwner()

  const parsed = createChallengeSchema.safeParse(formValues(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the challenge details.' }
  }

  try {
    await createChallenge(room.id, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'FLAG_IN_USE') {
      return { error: 'That flag is already used by another challenge.' }
    }
    return { error: 'Unable to create challenge. Please try again.' }
  }

  revalidatePath('/admin/challenges')
  redirect('/admin/challenges')
}

export async function updateChallengeAction(
  _previous: ChallengeActionState,
  formData: FormData
): Promise<ChallengeActionState> {
  const room = await requireDefaultRoomOwner()

  const parsed = updateChallengeSchema.safeParse(formValues(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the challenge details.' }
  }

  try {
    await updateChallenge(room.id, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'FLAG_IN_USE') {
      return { error: 'That flag is already used by another challenge.' }
    }
    if (error instanceof Error && error.message === 'CHALLENGE_NOT_FOUND') {
      return { error: 'Challenge not found.' }
    }
    return { error: 'Unable to update challenge. Please try again.' }
  }

  revalidatePath('/admin/challenges')
  redirect('/admin/challenges')
}

export async function toggleChallengeActiveAction(formData: FormData) {
  const room = await requireDefaultRoomOwner()

  const parsed = toggleChallengeActiveSchema.safeParse({
    id: formData.get('id'),
    active: formData.get('active'),
  })
  if (!parsed.success) return

  await setChallengeActive(parsed.data.id, room.id, parsed.data.active)
  revalidatePath('/admin/challenges')
}
