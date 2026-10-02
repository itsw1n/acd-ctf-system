'use client'

import type { ReactNode } from 'react'
import { Ban, Lock, LockOpen, Undo2 } from 'lucide-react'

import { Button } from '@/components/common/Button'

type MemberAction = (roomId: string, formData: FormData) => Promise<void>

function ActionForm({
  action,
  roomId,
  playerId,
  locked,
  children,
}: {
  action: MemberAction
  roomId: string
  playerId: string
  locked?: boolean
  children: ReactNode
}) {
  return (
    <form action={action.bind(null, roomId)}>
      <input type="hidden" name="playerId" value={playerId} />
      {locked !== undefined && <input type="hidden" name="locked" value={String(!locked)} />}
      {children}
    </form>
  )
}

export function MemberRowActions({
  roomId,
  playerId,
  locked,
  banAction,
  lockAction,
}: {
  roomId: string
  playerId: string
  locked: boolean
  banAction: MemberAction
  lockAction: MemberAction
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <ActionForm action={lockAction} roomId={roomId} playerId={playerId} locked={locked}>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          aria-label={locked ? 'Unlock member' : 'Lock member'}
        >
          {locked ? <LockOpen size={15} aria-hidden /> : <Lock size={15} aria-hidden />}
        </Button>
      </ActionForm>
      <ActionForm action={banAction} roomId={roomId} playerId={playerId}>
        <Button type="submit" variant="warning" size="sm" aria-label="Ban member">
          <Ban size={15} aria-hidden />
        </Button>
      </ActionForm>
    </div>
  )
}

export function BannedRowActions({
  roomId,
  playerId,
  unbanAction,
}: {
  roomId: string
  playerId: string
  unbanAction: MemberAction
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <ActionForm action={unbanAction} roomId={roomId} playerId={playerId}>
        <Button type="submit" variant="secondary" size="sm" aria-label="Unban member">
          <Undo2 size={15} aria-hidden />
          Unban
        </Button>
      </ActionForm>
    </div>
  )
}
