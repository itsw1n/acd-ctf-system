'use client'

import { useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { setSignupLockAction } from '@/features/competition/actions/competitionActions'

export function SignupLockControl({ locked }: { locked: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex flex-col gap-4 border border-danger/40 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-danger-bright">
            {locked ? 'Competition access locked' : 'Registration open'}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            {locked
              ? 'New signups and player account signins are blocked. Administrators can still sign in.'
              : 'Players can sign in and register.'}
          </p>
        </div>
        <Button
          type="button"
          variant={locked ? 'secondary' : 'warning'}
          size="sm"
          onPress={() => setOpen(true)}
        >
          {locked ? <LockOpen size={16} aria-hidden /> : <Lock size={16} aria-hidden />}
          {locked ? 'Unlock access' : 'Lock access'}
        </Button>
      </div>
      <ConfirmDialog
        title={locked ? 'Unlock competition access?' : 'Lock competition access?'}
        eyebrow="// Access control"
        isOpen={open}
        onOpenChange={setOpen}
        description={
          locked
            ? 'Player accounts will be able to sign in and register again.'
            : 'New registrations and player account signins will stop. Existing player sessions can continue.'
        }
        confirm={
          <form action={setSignupLockAction} onSubmit={() => setOpen(false)}>
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
