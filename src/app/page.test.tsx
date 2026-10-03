import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Room } from '@/features/rooms/types'
import RootPage from './page'

const { getCurrentPlayer, listPublicRooms, listMyRooms } = vi.hoisted(() => ({
  getCurrentPlayer: vi.fn(),
  listPublicRooms: vi.fn(),
  listMyRooms: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/features/sessions/services/sessionService', () => ({ getCurrentPlayer }))
vi.mock('@/features/rooms/services/roomService', () => ({ listPublicRooms, listMyRooms }))

const publicRoom: Room = {
  id: 'public-1',
  slug: 'alpha',
  name: 'Alpha Room',
  visibility: 'PUBLIC',
  joinLocked: false,
}
const secondPublicRoom: Room = {
  id: 'public-2',
  slug: 'bravo',
  name: 'Bravo Room',
  visibility: 'PUBLIC',
  joinLocked: true,
}
const privateRoom: Room = {
  id: 'private-1',
  slug: 'secret',
  name: 'Secret Room',
  visibility: 'PRIVATE',
  joinLocked: false,
}

afterEach(() => cleanup())

describe('RootPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getCurrentPlayer.mockResolvedValue(null)
    listPublicRooms.mockResolvedValue([])
    listMyRooms.mockResolvedValue([])
  })

  it('lists public rooms with join links for visitors and no leaderboard', async () => {
    listPublicRooms.mockResolvedValue([publicRoom, secondPublicRoom])

    render(await RootPage())

    expect(screen.getByText('Alpha Room')).toBeInTheDocument()
    expect(screen.getByText('Bravo Room')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Join room' }).map((link) => link.getAttribute('href'))
    ).toEqual(['/rooms/alpha/join', '/rooms/bravo/join'])
    expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/rank|points|pts/i)).not.toBeInTheDocument()
    expect(listMyRooms).not.toHaveBeenCalled()
  })

  it('opens joined public rooms but does not list private memberships', async () => {
    getCurrentPlayer.mockResolvedValue({ id: 'player-1' } as never)
    listPublicRooms.mockResolvedValue([publicRoom, secondPublicRoom])
    listMyRooms.mockResolvedValue([
      { room: publicRoom, role: 'PARTICIPANT', teamId: null },
      { room: privateRoom, role: 'OWNER', teamId: null },
    ])

    render(await RootPage())

    expect(screen.getByRole('link', { name: 'Open room' })).toHaveAttribute('href', '/rooms/alpha')
    expect(screen.getByRole('link', { name: 'Join room' })).toHaveAttribute(
      'href',
      '/rooms/bravo/join'
    )
    expect(screen.queryByText('Secret Room')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /secret/i })).not.toBeInTheDocument()
    expect(listMyRooms).toHaveBeenCalledWith('player-1')
  })

  it('shows an empty state when no public rooms are returned', async () => {
    render(await RootPage())

    expect(screen.getByText('No public rooms yet. Check back soon.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /join room|open room/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument()
  })
})
