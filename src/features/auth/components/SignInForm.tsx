'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Label, TextField } from 'react-aria-components'
import { CheckCircle2, KeyRound, LogIn, Terminal } from 'lucide-react'
import { signInAction, type SignInState } from '@/features/auth/actions/authActions'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { TacticalPanel } from '@/components/common/TacticalPanel'

const initialState: SignInState = {}

export function SignInForm({ resetSuccess }: { resetSuccess: boolean }) {
  const [state, action, pending] = useActionState(signInAction, initialState)

  return (
    <TacticalPanel label="Sign in" index="01" className="mx-auto max-w-2xl p-5 sm:p-7">
      <form action={action} className="space-y-5">
        {resetSuccess && (
          <p
            role="status"
            className="flex items-center gap-2 border border-success/60 bg-success/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.09em] text-success"
          >
            <CheckCircle2 size={16} aria-hidden />
            Password reset. Sign in with your new password.
          </p>
        )}

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

        <TextField name="password" type="password" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Password
          </Label>
          <div className="relative">
            <KeyRound
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={17}
              aria-hidden
            />
            <Input
              className="pl-11"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
        </TextField>

        {state.error && (
          <p
            role="alert"
            className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
          >
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" isPending={pending} className="w-full sm:w-auto">
          <LogIn size={18} aria-hidden />
          {pending ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 font-mono text-xs text-muted">
          <Link href="/signup" className="underline-offset-4 hover:text-foreground hover:underline">
            Create account
          </Link>
          <Link
            href="/forgot-password"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </p>
      </form>
    </TacticalPanel>
  )
}
