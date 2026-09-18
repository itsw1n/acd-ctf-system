import type { ChallengeType } from '@/features/challenges/schemas/challengeSchemas'

/**
 * Challenge data shaped for the admin edit form. Owned here (not in the
 * repository) so Client Components can use it without importing
 * server-only persistence modules.
 */
export type ChallengeEditRow = {
  id: string
  title: string
  category: string
  description: string
  type: ChallengeType
  points: number
  flag: string | null
  externalUrl: string | null
  fileUrl: string | null
  active: boolean
}
