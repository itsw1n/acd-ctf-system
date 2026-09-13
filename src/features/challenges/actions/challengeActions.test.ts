import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/admin/services/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/features/challenges/services/challengeService', () => ({
  createChallenge: vi.fn(),
  updateChallenge: vi.fn(),
}))

vi.mock('@/features/challenges/repositories/challengeRepository', () => ({
  setChallengeActive: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

import { requireAdmin } from '@/features/admin/services/requireAdmin'
import { createChallenge } from '@/features/challenges/services/challengeService'
import { createChallengeAction } from '@/features/challenges/actions/challengeActions'

function formData(entries: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(entries)) form.set(key, value)
  return form
}

const validForm = () =>
  formData({
    title: 'Welcome Flag',
    category: 'Misc',
    description: 'Find the hidden flag in the welcome post.',
    type: 'TEXT',
    points: '50',
    flag: 'ACD{hello}',
    active: 'on',
  })

describe('admin challenge actions authorization', () => {
  it('denies unauthenticated callers', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('REDIRECT:/signin'))
    await expect(createChallengeAction({}, validForm())).rejects.toThrow('REDIRECT:/signin')
    expect(vi.mocked(createChallenge)).not.toHaveBeenCalled()
  })

  it('denies non-admin players', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(createChallengeAction({}, validForm())).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(createChallenge)).not.toHaveBeenCalled()
  })

  it('allows admins to create challenges', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({ role: 'ADMIN' } as never)
    vi.mocked(createChallenge).mockResolvedValueOnce('new-id' as never)
    await expect(createChallengeAction({}, validForm())).rejects.toThrow(
      'REDIRECT:/admin/challenges'
    )
    expect(vi.mocked(createChallenge)).toHaveBeenCalledTimes(1)
  })
})
