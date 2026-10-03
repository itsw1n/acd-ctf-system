'use client'

import { useActionState } from 'react'
import { Label, TextField } from 'react-aria-components'
import { Save } from 'lucide-react'

import type { RoomActionState } from '@/features/rooms/actions/roomActions'
import type { Room } from '@/features/rooms/types'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { PendingDots } from '@/components/common/PendingDots'
import { Select } from '@/components/common/Select'
import { TacticalPanel } from '@/components/common/TacticalPanel'

export function RoomSettingsForm({
  room,
  action,
}: {
  room: Room
  action: (previous: RoomActionState, formData: FormData) => Promise<RoomActionState>
}) {
  const [state, formAction, pending] = useActionState(action, {} as RoomActionState)

  return (
    <TacticalPanel label="Room settings" className="p-5 sm:p-7">
      <form action={formAction} className="space-y-5">
        <TextField name="name" isRequired>
          <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Room name
          </Label>
          <Input defaultValue={room.name} maxLength={80} />
        </TextField>

        <Select
          id="visibility"
          name="visibility"
          label="Visibility"
          required
          defaultValue={room.visibility}
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
          <Save size={18} aria-hidden />
          {pending ? (
            <>
              Saving <PendingDots label="Saving settings" />
            </>
          ) : (
            'Save settings'
          )}
        </Button>
      </form>
    </TacticalPanel>
  )
}
