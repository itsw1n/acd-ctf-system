'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
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
import { ChevronDown, Copy, KeyRound, LogIn, Terminal, UserRound } from 'lucide-react'
import {
  joinPlayer,
  recoverPlayer,
  type JoinState,
  type RecoverState,
} from '@/features/players/actions/playerActions'
import type { Team } from '@/features/players/types'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { TacticalPanel } from '@/components/common/TacticalPanel'

const initialJoin: JoinState = {}
const initialRecover: RecoverState = {}

export function JoinAccess({ teams }: { teams: Team[] }) {
  const [joinState, joinAction, joinPending] = useActionState(joinPlayer, initialJoin)
  const [recoverState, recoverAction, recoverPending] = useActionState(
    recoverPlayer,
    initialRecover
  )
  const router = useRouter()

  useEffect(() => {
    if (recoverState.recovered) {
      router.push('/dashboard')
    }
  }, [recoverState.recovered, router])

  if (joinState.recoveryCode) {
    return (
      <TacticalPanel
        label="Recovery key issued"
        index="01"
        className="mx-auto max-w-2xl p-6 sm:p-9"
      >
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-success">
              {'// Registration complete'}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase text-foreground">
              Access <span className="text-danger-bright">Granted</span>
            </h2>
            <p className="mt-3 max-w-xl font-mono text-sm leading-6 text-muted">
              Save this recovery code now. It is the only recovery credential for
              <span className="text-foreground"> {joinState.alias}</span> if the browser session is
              lost.
            </p>
          </div>

          <div className="clip-input flex items-center justify-between border border-warning/60 bg-warning/5 p-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
                Recovery code
              </div>
              <div className="mt-1 font-mono text-xl font-bold tracking-[0.12em] text-foreground sm:text-2xl">
                {joinState.recoveryCode}
              </div>
            </div>
            <Copy className="text-warning" aria-hidden />
          </div>

          <p className="font-mono text-xs leading-5 text-muted">
            Take a screenshot or copy it somewhere safe. The platform stores only a hash and cannot
            display this exact code again.
          </p>

          <Link
            href="/dashboard"
            className="clip-button inline-flex min-h-12 items-center gap-2 border border-danger bg-primary px-6 font-mono text-sm font-bold uppercase tracking-[0.12em] text-foreground transition hover:bg-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <LogIn size={17} aria-hidden />
            Continue to dashboard
          </Link>
        </div>
      </TacticalPanel>
    )
  }

  if (recoverState.recovered) {
    return (
      <TacticalPanel label="Session restored" index="02" className="mx-auto max-w-2xl p-6 sm:p-9">
        <p className="font-mono text-sm uppercase tracking-[0.12em] text-success">
          Recovery accepted. Redirecting to your dashboard…
        </p>
      </TacticalPanel>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <TacticalPanel label="Join CTF" index="01" className="p-5 sm:p-7">
        <form action={joinAction} className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Create your team profile to enter the competition.
          </p>

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
              <Input className="pl-11" placeholder="Enter your full name" />
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
              <Input className="pl-11" placeholder="Choose your hacker tag" />
            </div>
          </TextField>

          {joinState.error && (
            <p
              role="alert"
              className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
            >
              {joinState.error}
            </p>
          )}

          <Button type="submit" size="lg" isPending={joinPending} className="w-full sm:w-auto">
            <LogIn size={18} aria-hidden />
            {joinPending ? 'Entering...' : 'Enter CTF'}
          </Button>
        </form>
      </TacticalPanel>

      <TacticalPanel label="Recover session" index="02" className="p-5 sm:p-7">
        <form action={recoverAction} className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Restore your access and get back to hacking.
          </p>

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
              <Input className="pl-11" placeholder="Enter your alias" />
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
              <Input className="pl-11 uppercase" placeholder="XXXX-XXXX-XXXX" />
            </div>
          </TextField>

          {recoverState.error && (
            <p
              role="alert"
              className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
            >
              {recoverState.error}
            </p>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            isPending={recoverPending}
            className="w-full"
          >
            <KeyRound size={18} aria-hidden />
            {recoverPending ? 'Recovering...' : 'Recover session'}
          </Button>

          <p className="border-t border-border pt-4 font-mono text-xs leading-5 text-muted">
            Use the alias and recovery code issued when you first joined.
          </p>
        </form>
      </TacticalPanel>
    </div>
  )
}
