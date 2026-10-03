import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomTabs } from '@/features/rooms/components/RoomTabs'

vi.mock('next/navigation', () => ({ usePathname: () => '/rooms/demo/admin' }))

afterEach(() => {
  cleanup()
})

describe('RoomTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owners see Overview and no Leaderboard', () => {
    render(<RoomTabs slug="demo" isOwner />)
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '/rooms/demo/admin'
    )
    expect(screen.queryByRole('link', { name: 'Leaderboard' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Challenges' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Activity' })).toBeNull()
  })

  it('participants keep Leaderboard and Play', () => {
    render(<RoomTabs slug="demo" isOwner={false} />)
    expect(screen.getByRole('link', { name: 'Leaderboard' })).toHaveAttribute('href', '/rooms/demo')
    expect(screen.getByRole('link', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute('href', '/rooms/demo/activity')
  })
})
