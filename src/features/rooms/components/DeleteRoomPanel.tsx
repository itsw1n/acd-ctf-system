'use client'

import { useActionState, useState } from 'react'
import { Trash2 } from 'lucide-react'

import type { RoomActionState } from '@/features/rooms/actions/roomActions'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Input } from '@/components/common/Input'
import { PendingDots } from '@/components/common/PendingDots'

export function DeleteRoomPanel({
  roomId,
  roomName,
  action,
}: {
  roomId: string
  roomName: string
  action: (previous: RoomActionState, formData: FormData) => Promise<RoomActionState>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [typed, setTyped] = useState('')
  // The action arrives already bound to roomId at the call site
  // (deleteRoomAction.bind(null, room.id)), matching RoomSettingsForm.
  void roomId
  const [state, formAction, pending] = useActionState(action, {} as RoomActionState)
  const matched = typed.trim() === roomName

  return (
    <div className="border border-danger/40 bg-danger/5 p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-danger-bright">
        Delete room
      </p>
      <p className="mt-1 font-mono text-xs text-muted">
        Permanently deletes challenges, teams, solves, and members. This cannot be undone.
      </p>
      <Button
        type="button"
        variant="warning"
        size="sm"
        className="mt-3"
        onPress={() => setIsOpen(true)}
      >
        <Trash2 size={15} aria-hidden />
        Delete room
      </Button>
      <ConfirmDialog
        title="Delete room"
        eyebrow="// Danger zone"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        description={
          <>
            Type <span className="font-bold text-foreground">{roomName}</span> to confirm deletion.
          </>
        }
        body={
          <>
            <div className="mt-4">
              <Input
                name="expectedNameVisible"
                aria-label={`Type ${roomName} to confirm`}
                value={typed}
                onChange={(e) => setTyped(e.currentTarget.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={roomName}
              />
            </div>
            {state.error && (
              <p role="alert" className="mt-2 font-mono text-xs text-danger-bright">
                {state.error}
              </p>
            )}
          </>
        }
        confirm={
          <form action={formAction}>
            <input type="hidden" name="expectedName" value={typed} />
            <Button
              type="submit"
              variant="warning"
              size="sm"
              isPending={pending}
              isDisabled={!matched || pending}
              className="w-full sm:w-auto"
            >
              {pending ? (
                <>
                  Deleting <PendingDots label="Deleting room" />
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </form>
        }
      />
    </div>
  )
}
