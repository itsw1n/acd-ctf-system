import 'server-only'
import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SESSION_COOKIE_NAME: z.string().min(1).default('acd_ctf_session'),
  FLAG_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'Must be 64 hex chars (32 bytes). Generate with: openssl rand -hex 32'),
})

export const env = schema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? 'acd_ctf_session',
  FLAG_ENCRYPTION_KEY: process.env.FLAG_ENCRYPTION_KEY,
})
