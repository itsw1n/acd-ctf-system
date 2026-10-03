import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DeleteRoomPanel } from '@/features/rooms/components/DeleteRoomPanel'

describe('DeleteRoomPanel', () => {
  it('keeps confirm disabled until the exact room name is typed', async () => {
    render(<DeleteRoomPanel roomId="r1" roomName="Alpha" action={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /delete room/i }))
    const confirm = screen.getByRole('button', { name: /^delete$/i })
    expect(confirm).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/type .* to confirm/i), {
      target: { value: 'Alpha' },
    })
    expect(confirm).toBeEnabled()
  })
})
