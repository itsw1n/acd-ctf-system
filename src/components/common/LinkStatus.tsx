'use client'

import { useLinkStatus } from 'next/link'
import { PendingDots } from '@/components/common/PendingDots'

export function LinkStatus({ label = 'Loading page' }: { label?: string }) {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return (
    <span aria-hidden={false} className="inline-flex">
      <PendingDots label={label} />
    </span>
  )
}
