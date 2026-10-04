import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PendingDots } from '@/components/common/PendingDots'

describe('PendingDots', () => {
  it('renders animated dots hidden from AT plus an sr-only label', () => {
    render(<PendingDots label="Joining" />)
    expect(screen.getByText('Joining', { selector: '.sr-only' })).toBeInTheDocument()
    const dots = document.querySelector('.pending-dots')
    expect(dots).not.toBeNull()
    expect(dots?.getAttribute('aria-hidden')).toBe('true')
    expect(dots?.textContent).toBe('')
  })
})
