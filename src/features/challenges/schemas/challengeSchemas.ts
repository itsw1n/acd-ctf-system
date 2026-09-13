import { z } from 'zod'

export const challengeTypeEnum = z.enum(['TEXT', 'FILE', 'EXTERNAL'])
export type ChallengeType = z.infer<typeof challengeTypeEnum>

/**
 * FormData checkoxes arrive as 'on' when checked and null when unchecked.
 * Do not use z.coerce.boolean(): 'false' would coerce to true. Be explicit.
 */
function parseActiveFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return value === 1
  const normalized = String(value).trim().toLowerCase()
  return normalized === 'true' || normalized === 'on' || normalized === '1' || normalized === 'checked'
}

export const activeInput = z.preprocess(parseActiveFlag, z.boolean())

function emptyToUndefined(value: unknown) {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string' && value.trim() === '') return undefined
  return value
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const optionalHttpUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(2048, 'URL must be at most 2048 characters.').refine(isHttpUrl, {
    message: 'Must be a valid http(s) URL.',
  }).optional()
)

const baseChallengeFields = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(120),
  category: z.string().trim().min(2, 'Category is required.').max(40),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(4000),
  type: challengeTypeEnum,
  points: z.coerce.number().int().min(1).max(1000),
  externalUrl: optionalHttpUrl,
  fileUrl: optionalHttpUrl,
  active: activeInput,
})

function checkUrlRules(
  value: { type: ChallengeType; externalUrl?: string; fileUrl?: string },
  ctx: z.RefinementCtx
) {
  if (value.type === 'FILE' && !value.fileUrl) {
    ctx.addIssue({ code: 'custom', path: ['fileUrl'], message: 'FILE challenges require a file URL.' })
  }
  if (value.type === 'EXTERNAL' && !value.externalUrl) {
    ctx.addIssue({
      code: 'custom',
      path: ['externalUrl'],
      message: 'EXTERNAL challenges require an external URL.',
    })
  }
  if (value.type === 'TEXT' && (value.fileUrl || value.externalUrl)) {
    ctx.addIssue({
      code: 'custom',
      path: ['fileUrl'],
      message: 'TEXT challenges must not have file or external URLs.',
    })
  }
}

export const createChallengeSchema = baseChallengeFields
  .extend({
    flag: z.string().trim().min(3, 'Flag is required.').max(512),
  })
  .superRefine(checkUrlRules)

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>

const optionalFlag = z.preprocess(emptyToUndefined, z.string().trim().min(3).max(512).optional())

export const updateChallengeSchema = baseChallengeFields
  .extend({
    id: z.string().uuid(),
    // Blank means keep the current flag_hash.
    flag: optionalFlag,
  })
  .superRefine(checkUrlRules)

export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>

export const toggleChallengeActiveSchema = z.object({
  id: z.string().uuid(),
  active: activeInput,
})
