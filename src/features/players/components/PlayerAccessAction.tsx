'use client'

import { useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { setPlayerAccessAction } from '@/features/players/actions/playerActions'

export function PlayerAccessAction({
  playerId,
  alias,
  locked,
}: {
  playerId: string
  alias: string
  locked: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant={locked ? 'secondary' : 'warning'}
        size="sm"
        onPress={() => setOpen(true)}
      >
        {locked ? <LockOpen size={15} aria-hidden /> : <Lock size={15} aria-hidden />}
        {locked ? 'Unlock' : 'Lock'}
      </Button>
      <ConfirmDialog
        title={locked ? 'Unlock player account?' : 'Lock player account?'}
        eyebrow="// Player access"
        isOpen={open}
        onOpenChange={setOpen}
        description={
          locked
            ? `Allow ${alias} to sign in and use the competition again?`
            : `Block ${alias} from signing in and revoke all active sessions?`
        }
        confirm={
          <form action={setPlayerAccessAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="playerId" value={playerId} />
            <input type="hidden" name="locked" value={String(!locked)} />
            <Button type="submit" variant={locked ? 'primary' : 'warning'} size="sm">
              Confirm
            </Button>
          </form>
        }
      />
    </>
  )
}
