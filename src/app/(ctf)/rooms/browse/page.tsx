import Link from 'next/link'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireAccount } from '@/features/rooms/services/requireRoom'
import { listMyRooms, listPublicRooms } from '@/features/rooms/services/roomService'

export default async function BrowseRoomsPage() {
  const player = await requireAccount()
  const [rooms, memberships] = await Promise.all([
    listPublicRooms(),
    listMyRooms(player.id),
  ])
  const memberRoomIds = new Set(memberships.map((membership) => membership.room.id))

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

        <TacticalPanel label="Have a code?" className="mb-5 p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              Private rooms need a join code.
            </p>
            <Link
              href="/rooms/join"
              className="clip-button inline-flex min-h-11 items-center justify-center gap-2 border border-danger-bright/70 bg-[linear-gradient(180deg,#e32636_0%,#b51622_45%,#8f1111_100%)] px-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition hover:brightness-110"
            >
              Enter join code
            </Link>
          </div>
        </TacticalPanel>

        <TacticalPanel label="Public rooms" className="p-5 sm:p-7">
          {!rooms.length && (
            <p className="py-8 text-center font-mono text-sm text-muted">
              No public rooms yet. Create the first one.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => {
              const isMember = memberRoomIds.has(room.id)
              return (
                <div key={room.id} className="border border-border bg-background/70 p-5">
                  <p className="font-display text-xl font-bold uppercase">{room.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {room.joinLocked ? 'Joining locked' : 'Open for joining'}
                  </p>
                  <Link
                    href={isMember ? `/rooms/${room.slug}` : `/rooms/${room.slug}/join`}
                    className="mt-4 inline-flex min-h-9 items-center justify-center border border-border-strong bg-surface px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-danger hover:text-white"
                  >
                    {isMember ? 'Open room' : 'Join room'}
                  </Link>
                </div>
              )
            })}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
