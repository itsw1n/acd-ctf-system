import 'server-only'

import { sha256 } from '@/lib/security/hash'
import type {
  CreateChallengeInput,
  UpdateChallengeInput,
} from '@/features/challenges/schemas/challengeSchemas'
import {
  getChallengeFlagHash,
  insertChallenge,
  updateChallengeRow,
} from '@/features/challenges/repositories/challengeRepository'

/** Trim-only normalization, matching flag submission + hash-flag script. */
export function normalizeFlag(flag: string) {
  return flag.trim()
}

export function hashFlag(flag: string) {
  return sha256(normalizeFlag(flag))
}

export async function createChallenge(input: CreateChallengeInput) {
  const flagHash = hashFlag(input.flag)
  return insertChallenge({
    title: input.title,
    category: input.category,
    description: input.description,
    type: input.type,
    points: input.points,
    flagHash,
    flag: normalizeFlag(input.flag),
    externalUrl: input.externalUrl,
    fileUrl: input.fileUrl,
    active: input.active,
  })
}

export async function updateChallenge(input: UpdateChallengeInput) {
  const existing = await getChallengeFlagHash(input.id)
  if (!existing) throw new Error('CHALLENGE_NOT_FOUND')

  const trimmedFlag = input.flag?.trim()
  await updateChallengeRow(input.id, {
    title: input.title,
    category: input.category,
    description: input.description,
    type: input.type,
    points: input.points,
    externalUrl: input.externalUrl,
    fileUrl: input.fileUrl,
    active: input.active,
    // Blank means keep the current flag and hash.
    ...(trimmedFlag ? { flag: trimmedFlag } : {}),
    ...(trimmedFlag ? { flagHash: hashFlag(trimmedFlag) } : {}),
  })
}
