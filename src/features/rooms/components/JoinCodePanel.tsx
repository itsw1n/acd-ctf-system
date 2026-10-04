'use client'

import { useActionState } from 'react'
import { Copy, KeyRound, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import type { RoomActionState } from '@/features/rooms/actions/roomActions'
import { Button } from '@/components/common/Button'

export function JoinCodePanel({
  roomId,
  code,
  action,
}: {
  roomId: string
  code: string | null
  action: (roomId: string) => Promise<RoomActionState>
}) {
  const [state, formAction, pending] = useActionState(action.bind(null, roomId), {})
  const [copied, setCopied] = useState(false)
  const display = state.code ?? code

  return (
    <div className="border border-border bg-background/75 p-4">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <KeyRound size={14} aria-hidden /> Join code
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="font-mono text-2xl font-bold tracking-[0.12em] text-foreground">
          {display ?? '—'}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onPress={() => {
            if (!display) return
            void navigator.clipboard
              ?.writeText(display)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }}
        >
          <Copy size={15} aria-hidden />
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <form action={formAction}>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isPending={pending}
            pendingLabel="Regenerating code"
          >
            <RotateCcw size={15} aria-hidden />
            Regenerate
          </Button>
        </form>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted">
        Share this code so participants can join. Regenerating invalidates the old code.
      </p>
    </div>
  )
}
