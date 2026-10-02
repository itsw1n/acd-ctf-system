import { beforeEach, describe, expect, it, vi } from 'vitest'

import { signUpSchema } from '@/features/auth/schemas/authSchemas'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/features/rooms/services/requireRoom', () => ({
  requireRoomOwnerById: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { listPlayersForAdmin } from '@/features/players/queries/playerAdminQueries'

const ROOM_ID = '22222222-2222-4222-8222-222222222222'

function tableChain(result: { data: unknown; error: null }) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => Promise.resolve(result))
  chain.eq = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.then = (resolve: (value: unknown) => unknown) => resolve(result)
  return chain
}

function mockTables(tables: Record<string, unknown>) {
  vi.mocked(createAdminClient).mockReturnValue({
    from: ((table: string) => tables[table]) as never,
  } as never)
}

describe('public signup cannot self-assign ADMIN', () => {
  it('strips role from signup input', () => {
    const parsed = signUpSchema.safeParse({
      teamId: '4b2873c8-01b9-4c22-9482-858276b94c43',
      fullName: 'Test Player',
      alias: 'testplayer',
      password: '0123456789',
      confirmPassword: '0123456789',
      role: 'ADMIN',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('role')
    }
  })

  it('still requires a team for public signup', () => {
    const withoutTeam = {
      fullName: 'Test Player',
      alias: 'testplayer',
      password: '0123456789',
      confirmPassword: '0123456789',
    }
    expect(signUpSchema.safeParse(withoutTeam).success).toBe(false)
  })
})

describe('admin reads do not expose authentication secrets', () => {
  beforeEach(() => {
    vi.mocked(requireRoomOwnerById).mockResolvedValue({ membership: { role: 'OWNER' } } as never)
  })

  it('player admin query enforces the owner guard before reading', async () => {
    mockTables({
      room_memberships: tableChain({ data: [], error: null }),
      players: tableChain({ data: [], error: null }),
      teams: tableChain({ data: [], error: null }),
    })

    await listPlayersForAdmin(ROOM_ID, {})

    expect(vi.mocked(requireRoomOwnerById)).toHaveBeenCalledWith(ROOM_ID)
  })

  it('player admin query fails closed when the guard denies', async () => {
    vi.mocked(requireRoomOwnerById).mockRejectedValueOnce(new Error('FORBIDDEN'))

    await expect(listPlayersForAdmin(ROOM_ID, {})).rejects.toThrow('FORBIDDEN')
  })

  it('player admin query selects display fields only', async () => {
    const selects: string[] = []
    const membershipsChain = tableChain({
      data: [
        {
          player_id: 'p1',
          team_id: 't1',
          role: 'PARTICIPANT',
          access_locked: false,
        },
      ],
      error: null,
    })

    const playersChain = tableChain({
      data: [
        {
          id: 'p1',
          full_name: 'Test Player',
          alias: 'tester',
          created_at: new Date().toISOString(),
        },
      ],
      error: null,
    })
    const playersSelect = playersChain.select as ReturnType<typeof vi.fn>
    playersSelect.mockImplementation((arg: string) => {
      selects.push(arg)
      return playersChain
    })

    mockTables({
      room_memberships: membershipsChain,
      players: playersChain,
      teams: tableChain({ data: [{ id: 't1', name: 'Ops' }], error: null }),
    })

    const rows = await listPlayersForAdmin(ROOM_ID, {})

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ alias: 'tester', team: 'Ops', role: 'PARTICIPANT' })
    expect(rows[0]).not.toHaveProperty('password_hash')
    expect(rows[0]).not.toHaveProperty('recovery_code_hash')
    expect(rows[0]).not.toHaveProperty('token_hash')
    for (const selection of selects) {
      expect(selection).not.toMatch(/password_hash|recovery_code_hash|token_hash/)
    }
  })
})
