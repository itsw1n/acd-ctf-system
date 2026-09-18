import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { checkAuthRateLimit, clearRateLimitBucketsForTests, RATE_LIMITED } from './rateLimit'

describe('checkAuthRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearRateLimitBucketsForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearRateLimitBucketsForTests()
  })

  it('allows calls under the limit', async () => {
    await expect(checkAuthRateLimit('b1', { limit: 2, windowMs: 60_000 })).resolves.toBeUndefined()
    await expect(checkAuthRateLimit('b1', { limit: 2, windowMs: 60_000 })).resolves.toBeUndefined()
  })

  it('throws RATE_LIMITED once the window is exhausted', async () => {
    await checkAuthRateLimit('b2', { limit: 2, windowMs: 60_000 })
    await checkAuthRateLimit('b2', { limit: 2, windowMs: 60_000 })
    await expect(checkAuthRateLimit('b2', { limit: 2, windowMs: 60_000 })).rejects.toThrow(
      RATE_LIMITED
    )
  })

  it('slides: expired hits stop counting', async () => {
    await checkAuthRateLimit('b3', { limit: 1, windowMs: 60_000 })
    await expect(checkAuthRateLimit('b3', { limit: 1, windowMs: 60_000 })).rejects.toThrow(
      RATE_LIMITED
    )
    vi.advanceTimersByTime(60_001)
    await expect(checkAuthRateLimit('b3', { limit: 1, windowMs: 60_000 })).resolves.toBeUndefined()
  })

  it('isolates buckets from each other', async () => {
    await checkAuthRateLimit('alice', { limit: 1, windowMs: 60_000 })
    await expect(checkAuthRateLimit('bob', { limit: 1, windowMs: 60_000 })).resolves.toBeUndefined()
    await expect(checkAuthRateLimit('alice', { limit: 1, windowMs: 60_000 })).rejects.toThrow(
      RATE_LIMITED
    )
  })

  it('blocked calls do not extend the throttle', async () => {
    await checkAuthRateLimit('b4', { limit: 1, windowMs: 60_000 })
    await expect(checkAuthRateLimit('b4', { limit: 1, windowMs: 60_000 })).rejects.toThrow(
      RATE_LIMITED
    )
    vi.advanceTimersByTime(60_001)
    // If the rejected call had recorded a hit, this would still be throttled.
    await expect(checkAuthRateLimit('b4', { limit: 1, windowMs: 60_000 })).resolves.toBeUndefined()
  })
})
