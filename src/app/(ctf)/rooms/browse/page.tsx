import Link from 'next/link'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireAccount } from '@/features/rooms/services/requireRoom'
import { listPublicRooms } from '@/features/rooms/services/roomService'

export default async function BrowseRoomsPage() {
  await requireAccount()
  const rooms = await listPublicRooms()

  return (
    <Section data-ui="rooms-browse">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Browse <span className="text-danger-bright">rooms</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Public rooms anyone can join. Private rooms need a join code.
          </p>
        </div>

        <TacticalPanel label="Public rooms" className="p-5 sm:p-7">
          {!rooms.length && (
            <p className="py-8 text-center font-mono text-sm text-muted">
              No public rooms yet. Create the first one.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => (
              <div key={room.id} className="border border-border bg-background/70 p-5">
                <p className="font-display text-xl font-bold uppercase">{room.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {room.joinLocked ? 'Joining locked' : 'Open for joining'}
                </p>
                <Link
                  href={`/rooms/${room.slug}`}
                  className="mt-4 inline-flex min-h-9 items-center justify-center border border-border-strong bg-surface px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-danger hover:text-white"
                >
                  View room
                </Link>
              </div>
            ))}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
