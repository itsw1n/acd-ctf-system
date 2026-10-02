import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireAccount } from '@/features/rooms/services/requireRoom'
import { createRoomAction } from '@/features/rooms/actions/roomActions'
import { RoomForm } from '@/features/rooms/components/RoomForm'

export default async function NewRoomPage() {
  await requireAccount()

  return (
    <Section data-ui="room-new">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            New <span className="text-danger-bright">room</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            You become this room&apos;s owner. Owners manage but cannot play their own room.
          </p>
        </div>

        <RoomForm action={createRoomAction} />
      </Container>
    </Section>
  )
}
