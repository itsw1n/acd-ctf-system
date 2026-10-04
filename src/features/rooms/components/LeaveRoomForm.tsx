'use client'

import { useActionState } from 'react'
import { Button } from '@/components/common/Button'

export function LeaveRoomForm({ action }: { action: () => Promise<void> }) {
  const [, formAction, pending] = useActionState(async () => {
    await action()
  }, null)
  return (
    <form action={formAction} className="mt-4">
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        isPending={pending}
        pendingLabel="Leaving room"
      >
        Leave room
      </Button>
    </form>
  )
}
