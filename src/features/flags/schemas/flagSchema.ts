import { z } from 'zod'

export const flagSchema = z.object({
  flag: z.string().trim().min(3).max(512),
})
