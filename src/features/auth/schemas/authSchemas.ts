import { z } from 'zod'

const aliasPattern = /^[A-Za-z0-9_-]+$/

const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters.')
  .max(128, 'Password must be at most 128 characters.')

const aliasSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(aliasPattern, 'Use letters, numbers, underscores, or hyphens only.')

export const signUpSchema = z
  .object({
    teamId: z.string().uuid(),
    fullName: z.string().trim().min(2).max(80),
    alias: aliasSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  alias: aliasSchema,
  // Not length-checked: any string is verified against the stored hash so
  // unknown aliases and wrong passwords are indistinguishable.
  password: z.string().min(1),
})

export const resetPasswordSchema = z
  .object({
    alias: aliasSchema,
    recoveryCode: z.string().trim().min(8).max(32),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
