'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField,
} from 'react-aria-components'
import { Check, ChevronDown, Copy, LogIn, Terminal, UserRound, Users } from 'lucide-react'
import { signUpAction, type SignUpState } from '@/features/auth/actions/authActions'
import type { Team } from '@/features/players/types'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { TacticalPanel } from '@/components/common/TacticalPanel'

const initialState: SignUpState = {}

export function SignUpForm({ teams }: { teams: Team[] }) {
  const [state, action, pending] = useActionState(signUpAction, initialState)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  if (state.recoveryCode) {
    return (
      <TacticalPanel
        label="Recovery key issued"
        index="01"
        className="mx-auto max-w-2xl p-6 sm:p-9"
      >
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-success">
              {'// Account created'}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase text-foreground">
              Save your <span className="text-danger-bright">recovery code</span>
            </h2>
            <p className="mt-3 max-w-xl font-mono text-sm leading-6 text-muted">
              This code will only be shown once. You will need it
              <span className="text-foreground"> {state.alias}</span> if you forget your
              password.
            </p>
          </div>

          <div className="clip-input flex items-center justify-between gap-4 border border-warning/60 bg-warning/5 p-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
                Recovery code
              </div>
              <div className="mt-1 font-mono text-xl font-bold tracking-[0.12em] text-foreground sm:text-2xl">
                {state.recoveryCode}
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onPress={() => {
                void navigator.clipboard
                  ?.writeText(state.recoveryCode ?? '')
                  .then(() => setCopied(true))
                  .catch(() => setCopied(false))
              }}
            >
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onPress={() => {
              router.push('/dashboard')
            }}
          >
            <LogIn size={18} aria-hidden />I saved my code — continue
          </Button>
        </div>
      </TacticalPanel>
    )
  }

  return (
    <TacticalPanel label="Create account" index="01" className="mx-auto max-w-2xl p-5 sm:p-7">
      <form action={action} className="space-y-5">
        <Select name="teamId" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Team
          </Label>
          <AriaButton className="clip-input flex h-12 w-full items-center justify-between border border-border-strong bg-background/90 px-4 text-left font-mono text-sm text-foreground outline-none transition focus:border-danger">
            <SelectValue className="truncate" />
            <ChevronDown size={17} className="text-danger" aria-hidden />
          </AriaButton>
          <Popover className="w-[--trigger-width] border border-border-strong bg-surface shadow-2xl outline-none">
            <ListBox className="outline-none">
              {teams.map((team) => (
                <ListBoxItem
                  id={team.id}
                  key={team.id}
                  textValue={team.name}
                  className="cursor-default px-4 py-3 font-mono text-sm text-foreground outline-none data-[focused]:bg-primary/25 data-[selected]:text-danger-bright"
                >
                  {team.name}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>

        <TextField name="fullName" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Full name
          </Label>
          <div className="relative">
            <UserRound
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={17}
              aria-hidden
            />
            <Input className="pl-11" placeholder="Enter your full name" autoComplete="name" />
          </div>
        </TextField>

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
              placeholder="Choose your hacker tag"
              autoComplete="username"
            />
          </div>
        </TextField>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="password" type="password" isRequired>
            <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Password
            </Label>
            <Input
              className="pl-4"
              placeholder="Minimum 10 characters"
              autoComplete="new-password"
            />
          </TextField>

          <TextField name="confirmPassword" type="password" isRequired>
            <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Confirm password
            </Label>
            <Input
              className="pl-4"
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </TextField>
        </div>

        {state.error && (
          <p
            role="alert"
            className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
          >
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" isPending={pending} className="w-full sm:w-auto">
          <Users size={18} aria-hidden />
          {pending ? 'Creating...' : 'Create account'}
        </Button>
      </form>
    </TacticalPanel>
  )
}
