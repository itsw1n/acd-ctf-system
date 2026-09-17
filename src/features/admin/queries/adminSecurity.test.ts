import { beforeEach, describe, expect, it, vi } from 'vitest'

import { signUpSchema } from '@/features/auth/schemas/authSchemas'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/features/admin/services/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/features/admin/services/requireAdmin'
import { listPlayersForAdmin } from '@/features/players/queries/playerAdminQueries'

function tableChain(result: { data: unknown; error: null }) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => Promise.resolve(result))
  chain.eq = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  return chain
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
    vi.mocked(requireAdmin).mockResolvedValue({ role: 'ADMIN' } as never)
  })

  it('player admin query enforces the admin guard before reading', async () => {
    const playersChain = tableChain({ data: [], error: null })
    const teamsChain = tableChain({ data: [], error: null })
    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => (table === 'players' ? playersChain : teamsChain)) as never,
    } as never)

    await listPlayersForAdmin({})

    expect(vi.mocked(requireAdmin)).toHaveBeenCalledTimes(1)
  })

  it('player admin query fails closed when the guard denies', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('FORBIDDEN'))

    await expect(listPlayersForAdmin({})).rejects.toThrow('FORBIDDEN')
  })

  it('player admin query selects display fields only', async () => {
    const selects: string[] = []
    const playersResult = {
      data: [
        {
          id: 'p1',
          full_name: 'Test Player',
          alias: 'tester',
          team_id: 't1',
          role: 'PLAYER',
          created_at: new Date().toISOString(),
        },
      ],
      error: null,
    }

    const playersChain = tableChain(playersResult)
    const playersSelect = playersChain.select as ReturnType<typeof vi.fn>
    playersSelect.mockImplementation((arg: string) => {
      selects.push(arg)
      return playersChain
    })

    const teamsChain = tableChain({ data: [{ id: 't1', name: 'Ops' }], error: null })

    vi.mocked(createAdminClient).mockReturnValue({
      from: ((table: string) => (table === 'players' ? playersChain : teamsChain)) as never,
    } as never)

    const rows = await listPlayersForAdmin({})

    expect(rows).toHaveLength(1)
    expect(rows[0]).not.toHaveProperty('password_hash')
    expect(rows[0]).not.toHaveProperty('recovery_code_hash')
    expect(rows[0]).not.toHaveProperty('token_hash')
    for (const selection of selects) {
      expect(selection).not.toMatch(/password_hash|recovery_code_hash|token_hash/)
    }
  })
})
