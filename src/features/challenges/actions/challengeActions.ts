'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/features/admin/services/requireAdmin'
import {
  createChallengeSchema,
  toggleChallengeActiveSchema,
  updateChallengeSchema,
} from '@/features/challenges/schemas/challengeSchemas'
import {
  createChallenge,
  updateChallenge,
} from '@/features/challenges/services/challengeService'
import { setChallengeActive } from '@/features/challenges/repositories/challengeRepository'

export type ChallengeActionState = {
  error?: string
}

function formValues(formData: FormData) {
  return {
    id: formData.get('id'),
    title: formData.get('title'),
    category: formData.get('category'),
    description: formData.get('description'),
    type: formData.get('type'),
    points: formData.get('points'),
    flag: formData.get('flag'),
    externalUrl: formData.get('externalUrl'),
    fileUrl: formData.get('fileUrl'),
    active: formData.get('active'),
  }
}

export async function createChallengeAction(
  _previous: ChallengeActionState,
  formData: FormData
): Promise<ChallengeActionState> {
  await requireAdmin()

  const parsed = createChallengeSchema.safeParse(formValues(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the challenge details.' }
  }

  try {
    await createChallenge(parsed.data)
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
  await requireAdmin()

  const parsed = updateChallengeSchema.safeParse(formValues(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the challenge details.' }
  }

  try {
    await updateChallenge(parsed.data)
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
  await requireAdmin()

  const parsed = toggleChallengeActiveSchema.safeParse({
    id: formData.get('id'),
    active: formData.get('active'),
  })
  if (!parsed.success) return

  await setChallengeActive(parsed.data.id, parsed.data.active)
  revalidatePath('/admin/challenges')
}
