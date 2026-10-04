'use client'

import { useTransition } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'

export function JoinLockControl({
  roomId,
  locked,
  action,
}: {
  roomId: string
  locked: boolean
  action: (roomId: string, formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()
  return (
    <div className="flex flex-col gap-4 border border-danger/40 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-danger-bright">
          {locked ? 'Joining locked' : 'Joining open'}
        </p>
        <p className="mt-1 font-mono text-xs text-muted">
          {locked
            ? 'No new members can join, even with the code.'
            : 'Anyone with access can join this room.'}
        </p>
      </div>
      <form action={(formData) => startTransition(() => action(roomId, formData))}>
        <input type="hidden" name="locked" value={String(!locked)} />
        <Button
          type="submit"
          variant={locked ? 'secondary' : 'warning'}
          size="sm"
          isPending={pending}
          pendingLabel="Updating join lock"
        >
          {locked ? <LockOpen size={16} aria-hidden /> : <Lock size={16} aria-hidden />}
          {locked ? 'Unlock joining' : 'Lock joining'}
        </Button>
      </form>
    </div>
  )
}
