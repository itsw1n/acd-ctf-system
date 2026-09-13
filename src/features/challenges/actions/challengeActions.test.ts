import { beforeEach, describe, expect, it, vi } from 'vitest'

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
import { createChallenge, updateChallenge } from '@/features/challenges/services/challengeService'
import { setChallengeActive } from '@/features/challenges/repositories/challengeRepository'
import {
  createChallengeAction,
  toggleChallengeActiveAction,
  updateChallengeAction,
} from '@/features/challenges/actions/challengeActions'

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
  beforeEach(() => vi.clearAllMocks())

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

  it('denies PLAYER update without touching the mutation', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('FORBIDDEN'))
    const form = validForm()
    form.set('id', '4b2873c8-01b9-4c22-9482-858276b94c43')
    await expect(updateChallengeAction({}, form)).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(updateChallenge)).not.toHaveBeenCalled()
  })

  it('denies PLAYER toggle without touching the mutation', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('FORBIDDEN'))
    const form = formData({ id: '4b2873c8-01b9-4c22-9482-858276b94c43', active: 'false' })
    await expect(toggleChallengeActiveAction(form)).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(setChallengeActive)).not.toHaveBeenCalled()
  })
})
