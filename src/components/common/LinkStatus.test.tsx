import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const pendingState = { pending: false }
vi.mock('next/link', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/link')>()
  return { ...actual, useLinkStatus: () => pendingState }
})

import { LinkStatus } from '@/components/common/LinkStatus'

describe('LinkStatus', () => {
  it('renders nothing when idle', () => {
    pendingState.pending = false
    const { container } = render(<LinkStatus />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders dots while the link navigation is pending', () => {
    pendingState.pending = true
    render(<LinkStatus />)
    expect(screen.getByText('Loading page', { selector: '.sr-only' })).toBeInTheDocument()
  })
})
