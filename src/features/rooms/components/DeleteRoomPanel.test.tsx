import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DeleteRoomPanel } from '@/features/rooms/components/DeleteRoomPanel'

afterEach(() => {
  cleanup()
})

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

  it('keeps the typed input outside the footer submit form', async () => {
    render(<DeleteRoomPanel roomId="r1" roomName="Alpha" action={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /delete room/i }))
    const visible = screen.getByLabelText(/type alpha to confirm/i)
    expect(visible.closest('form')).toBeNull()
    expect(visible.getAttribute('name')).not.toBe('expectedName')
    const hidden = document.querySelector('input[name="expectedName"][type="hidden"]')
    expect(hidden).not.toBeNull()
  })
})
