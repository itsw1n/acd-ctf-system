import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Button } from '@/components/common/Button'

afterEach(cleanup)

describe('Button', () => {
  it('renders pending dots and an accessible pending label', () => {
    render(
      <Button isPending pendingLabel="Saving settings">
        Save settings
      </Button>,
    )

    expect(screen.getByRole('button', { name: /Save settings/ })).toBeInTheDocument()
    expect(screen.getByText('Saving settings', { selector: '.sr-only' })).toBeInTheDocument()
    expect(document.querySelector('.pending-dots')).toBeInTheDocument()
  })

  it('does not render pending dots when idle', () => {
    render(<Button pendingLabel="Saving settings">Save settings</Button>)

    expect(document.querySelector('.pending-dots')).not.toBeInTheDocument()
  })
})
