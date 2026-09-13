'use client'

import { useActionState, useState } from 'react'
import { Label, TextField } from 'react-aria-components'
import { KeyRound, RotateCcw, Terminal } from 'lucide-react'
import {
  resetPasswordAction,
  type ResetPasswordState,
} from '@/features/auth/actions/authActions'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { TacticalPanel } from '@/components/common/TacticalPanel'

const initialState: ResetPasswordState = {}

export function ResetPasswordForm() {
  // Client-side step only. Step 2 resubmits alias + code + new passwords so
  // the server re-verifies everything; no reset-token state is trusted.
  const [verified, setVerified] = useState(false)
  const [state, action, pending] = useActionState(resetPasswordAction, initialState)

  return (
    <TacticalPanel label="Reset password" index="01" className="mx-auto max-w-2xl p-5 sm:p-7">
      <form action={action} className="space-y-5">
        <TextField name="alias" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Alias / Hacker tag
          </Label>
          <div className="relative">
            <Terminal
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={17}
              aria-hidden
            />
            <Input
              className="pl-11"
              placeholder="Enter your alias"
              autoComplete="username"
            />
          </div>
        </TextField>

        <TextField name="recoveryCode" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Recovery code
          </Label>
          <div className="relative">
            <KeyRound
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={17}
              aria-hidden
            />
            <Input className="pl-11 uppercase" placeholder="ACD-XXXX-XXXX-XXXX" />
          </div>
        </TextField>

        {verified && (
          <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
            <TextField name="newPassword" type="password" isRequired>
              <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                New password
              </Label>
              <Input
                className="pl-4"
                placeholder="Minimum 10 characters"
                autoComplete="new-password"
              />
            </TextField>

            <TextField name="confirmPassword" type="password" isRequired>
              <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Confirm new password
              </Label>
              <Input
                className="pl-4"
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </TextField>
          </div>
        )}

        {state.error && (
          <p
            role="alert"
            className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
          >
            {state.error}
          </p>
        )}

        {!verified ? (
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onPress={() => setVerified(true)}
          >
            <KeyRound size={18} aria-hidden />
            Verify &amp; continue
          </Button>
        ) : (
          <Button type="submit" size="lg" isPending={pending} className="w-full sm:w-auto">
            <RotateCcw size={18} aria-hidden />
            {pending ? 'Resetting...' : 'Reset password'}
          </Button>
        )}

        <p className="border-t border-border pt-4 font-mono text-xs leading-5 text-muted">
          Use the alias and recovery code issued when you created your account. Resetting signs
          you out everywhere.
        </p>
      </form>
    </TacticalPanel>
  )
}
