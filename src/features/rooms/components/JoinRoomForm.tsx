'use client'

import { useActionState } from 'react'
import { Users } from 'lucide-react'

import type { RoomActionState } from '@/features/rooms/actions/roomActions'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { TacticalPanel } from '@/components/common/TacticalPanel'

export function JoinRoomForm({
  code,
  roomName,
  teams,
  action,
}: {
  code?: string
  roomName: string
  teams: Array<{ id: string; name: string }>
  action: (previous: RoomActionState, formData: FormData) => Promise<RoomActionState>
}) {
  const [state, formAction, pending] = useActionState(action, {} as RoomActionState)

  return (
    <TacticalPanel label="Join room" index="01" className="mx-auto max-w-2xl p-5 sm:p-7">
      <p className="mb-5 font-mono text-sm text-muted">
        Room: <span className="font-bold text-foreground">{roomName}</span>
      </p>
      <form action={formAction} className="space-y-5">
        {code !== undefined && <input type="hidden" name="code" value={code} />}
        <Select
          id="teamId"
          name="teamId"
          label="Team"
          required
          defaultValue=""
          placeholder="Select a team"
          options={teams.map((team) => ({ id: team.id, label: team.name }))}
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
          <Users size={18} aria-hidden />
          {pending ? 'Joining...' : 'Join room'}
        </Button>
      </form>
    </TacticalPanel>
  )
}
