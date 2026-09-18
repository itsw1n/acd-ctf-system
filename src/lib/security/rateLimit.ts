import 'server-only'

/**
 * Abuse protection for authentication and flag-submission actions.
 *
 * In-memory sliding-window limiter, called by every abuse-sensitive server
 * action (signup, signin, forgot-password verification, password reset, flag
 * submission) with a caller-chosen bucket key such as `signin:<alias-lower>`.
 *
 * Scope and limits of this implementation:
 * - Single-instance only: counts live in process memory, so they reset on
 *   every restart/deploy and are not shared across instances. Correct for a
 *   classroom running one server; before any multi-instance or public event,
 *   replace the store here with a shared provider (for example Upstash Redis
 *   sliding-window) behind the same `checkAuthRateLimit` signature.
 * - Buckets are per-account keys, never per-IP, so a whole classroom behind
 *   one NAT address does not throttle itself.
 *
 * Contract: throws `RATE_LIMITED` when the bucket is exhausted. Actions map
 * it to a generic message (never reveal whether an alias exists).
 *
 * Never pass passwords, tokens, or hashes as (part of) the key.
 */

export const RATE_LIMITED = 'RATE_LIMITED'

type Window = { limit: number; windowMs: number }

const DEFAULT_WINDOW: Window = { limit: 10, windowMs: 60_000 }

/** Upper bound on tracked buckets; exceeded only under active abuse. */
const MAX_BUCKETS = 5_000

const hits = new Map<string, number[]>()

function prune(bucket: string, now: number, windowMs: number): number[] {
  const kept = (hits.get(bucket) ?? []).filter((at) => now - at < windowMs)
  if (kept.length === 0) {
    hits.delete(bucket)
  } else {
    hits.set(bucket, kept)
  }
  return kept
}

function sweepExpired(now: number): void {
  for (const [bucket, times] of hits) {
    if (times.length === 0 || now - times[times.length - 1] >= 60_000) {
      const kept = times.filter((at) => now - at < 60_000)
      if (kept.length === 0) hits.delete(bucket)
      else hits.set(bucket, kept)
    }
  }
}

export async function checkAuthRateLimit(
  bucket: string,
  window: Window = DEFAULT_WINDOW
): Promise<void> {
  const now = Date.now()
  if (hits.size > MAX_BUCKETS) sweepExpired(now)

  const kept = prune(bucket, now, window.windowMs)
  if (kept.length >= window.limit) {
    throw new Error(RATE_LIMITED)
  }
  kept.push(now)
  hits.set(bucket, kept)
}

/** Test-only hook: resets all buckets for deterministic tests. */
export function clearRateLimitBucketsForTests(): void {
  hits.clear()
}
