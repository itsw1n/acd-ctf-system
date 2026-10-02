'use client'

import { useActionState } from 'react'
import { Label, TextField } from 'react-aria-components'

import type { RoomActionState } from '@/features/rooms/actions/roomActions'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { TacticalPanel } from '@/components/common/TacticalPanel'

export function RoomForm({
  action,
}: {
  action: (previous: RoomActionState, formData: FormData) => Promise<RoomActionState>
}) {
  const [state, formAction, pending] = useActionState(action, {} as RoomActionState)

  return (
    <TacticalPanel label="New room" index="01" className="mx-auto max-w-2xl p-5 sm:p-7">
      <form action={formAction} className="space-y-5">
        <TextField name="name" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Room name
          </Label>
          <Input placeholder="Friday Night CTF" maxLength={80} />
        </TextField>

        <Select
          id="visibility"
          name="visibility"
          label="Visibility"
          defaultValue="PUBLIC"
          options={[
            { id: 'PUBLIC', label: 'Public — listed, anyone can join' },
            { id: 'PRIVATE', label: 'Private — join code only' },
          ]}
        />

        {state.error && (
          <p
            role="alert"
            className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
          >
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" isPending={pending} className="w-full sm:w-auto">
          {pending ? 'Creating...' : 'Create room'}
        </Button>
      </form>
    </TacticalPanel>
  )
}
