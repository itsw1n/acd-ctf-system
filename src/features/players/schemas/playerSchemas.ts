import { z } from 'zod'

const aliasPattern = /^[A-Za-z0-9_-]+$/

export const joinSchema = z.object({
  teamId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(80),
  alias: z
    .string()
    .trim()
    .min(2)
    .max(24)
    .regex(aliasPattern, 'Use letters, numbers, underscores, or hyphens only.'),
})

export const recoverSchema = z.object({
  alias: z.string().trim().min(2).max(24),
  recoveryCode: z.string().trim().min(8).max(32),
})
