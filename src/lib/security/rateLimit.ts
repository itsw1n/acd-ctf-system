import 'server-only'

/**
 * Trusted boundary for authentication rate limiting.
 *
 * Called by every abuse-sensitive server action (signup, signin,
 * forgot-password verification, password reset, flag submission) with a
 * caller-chosen bucket key such as `signin:<alias-lower>`.
 *
 * This version intentionally performs NO enforcement: an in-memory counter
 * would be per-instance, reset on every deploy, and shared across tenants on
 * serverless — unsafe to present as protection. Before any public event,
 * integrate a production-compatible provider here (for example Upstash Redis
 * sliding-window via VERCEL environment) and throw a rate-limit error that
 * actions map to a generic message.
 *
 * Never pass passwords, tokens, or hashes as (part of) the key.
 */
export async function checkAuthRateLimit(_bucket: string): Promise<void> {
  return
}
