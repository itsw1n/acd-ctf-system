import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomOwnerById: vi.fn(),
}))

vi.mock('@/features/teams/services/teamService', async () => {
  // Schemas are re-declared here (rather than importOriginal) so this test
  // never loads the repository/env chain; it exercises auth gating, not shape.
  const { z } = await import('zod')
  return {
    createTeam: vi.fn(),
    renameTeam: vi.fn(),
    createTeamSchema: z.object({ name: z.string().trim().min(2).max(60) }),
    renameTeamSchema: z.object({ id: z.string().uuid(), name: z.string().trim().min(2).max(60) }),
  }
})

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { createTeam, renameTeam } from '@/features/teams/services/teamService'
import { createTeamAction, renameTeamAction } from '@/features/teams/actions/teamActions'

function formData(entries: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(entries)) form.set(key, value)
  return form
}

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

describe('admin team actions authorization', () => {
  beforeEach(() => vi.clearAllMocks())

  it('denies PLAYER create without touching the mutation', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(createTeamAction(ROOM_ID, {}, formData({ name: 'Sneaky' }))).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(createTeam)).not.toHaveBeenCalled()
  })

  it('denies PLAYER rename without touching the mutation', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))
    await expect(
      renameTeamAction(ROOM_ID, {}, formData({ id: '4b2873c8-01b9-4c22-9482-858276b94c43', name: 'Sneaky' }))
    ).rejects.toThrow('FORBIDDEN')
    expect(vi.mocked(renameTeam)).not.toHaveBeenCalled()
  })

  it('allows room owners to create teams in their room', async () => {
    vi.mocked(requireRoomOwnerById).mockResolvedValueOnce({
      membership: { role: 'OWNER' },
    } as never)
    vi.mocked(createTeam).mockResolvedValueOnce('team-id' as never)
    await expect(createTeamAction(ROOM_ID, {}, formData({ name: 'Ops' }))).rejects.toThrow(
      'REDIRECT:/admin/teams'
    )
    expect(vi.mocked(requireRoomOwnerById)).toHaveBeenCalledWith(ROOM_ID)
    expect(vi.mocked(createTeam)).toHaveBeenCalledWith(ROOM_ID, expect.any(Object))
  })
})
