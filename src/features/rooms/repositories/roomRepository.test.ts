import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_ROOM_SLUG, getDefaultRoom } from '@/features/rooms/repositories/roomRepository'

function singleRow(row: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data: row, error: null }))
  return chain
}

describe('getDefaultRoom', () => {
  it('loads the default room by its well-known slug', async () => {
    const from = vi.fn(() => singleRow({ id: 'room-1', slug: 'acd-ctf' }))
    vi.mocked(createAdminClient).mockReturnValue({ from } as never)

    const room = await getDefaultRoom()

    expect(DEFAULT_ROOM_SLUG).toBe('acd-ctf')
    expect(from).toHaveBeenCalledWith('rooms')
    expect(room).toMatchObject({ slug: 'acd-ctf' })
  })
})
