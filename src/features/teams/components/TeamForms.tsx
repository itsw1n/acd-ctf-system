'use client'

import { useActionState } from 'react'
import { Label, TextField } from 'react-aria-components'
import { Pencil, Plus } from 'lucide-react'

import type { TeamActionState } from '@/features/teams/actions/teamActions'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { TacticalPanel } from '@/components/common/TacticalPanel'

export function CreateTeamForm({
  action,
}: {
  action: (previous: TeamActionState, formData: FormData) => Promise<TeamActionState>
}) {
  const [state, formAction, pending] = useActionState(action, {} as TeamActionState)

  return (
    <TacticalPanel label="Create team" className="p-5 sm:p-7">
      <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <TextField name="name" isRequired className="min-w-0 flex-1">
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Team name
          </Label>
          <Input placeholder="New team name" maxLength={60} />
        </TextField>
        <Button type="submit" size="md" isPending={pending} className="w-full sm:w-auto">
          <Plus size={17} aria-hidden />
          {pending ? 'Creating...' : 'Create team'}
        </Button>
      </form>
      {state.error && (
        <p
          role="alert"
          className="mt-4 border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
        >
          {state.error}
        </p>
      )}
    </TacticalPanel>
  )
}

export function RenameTeamForm({
  teamId,
  defaultName,
  action,
}: {
  teamId: string
  defaultName: string
  action: (previous: TeamActionState, formData: FormData) => Promise<TeamActionState>
}) {
  const [state, formAction, pending] = useActionState(action, {} as TeamActionState)

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={teamId} />
      <TextField name="name" className="block">
        <Label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Team name
        </Label>
        <Input defaultValue={defaultName} maxLength={60} aria-label="Team name" />
      </TextField>
      <Button type="submit" size="lg" isPending={pending} className="w-full">
        <Pencil size={15} aria-hidden />
        {pending ? 'Saving...' : 'Save'}
      </Button>
      {state.error && (
        <span role="alert" className="font-mono text-[11px] text-danger-bright">
          {state.error}
        </span>
      )}
    </form>
  )
}
