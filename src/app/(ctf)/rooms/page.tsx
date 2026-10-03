import Link from 'next/link'
import { Plus, Ticket } from 'lucide-react'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireAccount } from '@/features/rooms/services/requireRoom'
import { listMyRooms } from '@/features/rooms/services/roomService'

export default async function RoomsPage() {
  const player = await requireAccount()
  const memberships = await listMyRooms(player.id)
  const owned = memberships.filter((membership) => membership.role === 'OWNER')
  const joined = memberships.filter((membership) => membership.role !== 'OWNER')

  return (
    <Section data-ui="rooms">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              My <span className="text-danger-bright">rooms</span>
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Host your own competitions or join others.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rooms/browse"
              className="clip-button inline-flex min-h-11 items-center justify-center gap-2 border border-border-strong bg-surface px-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-danger hover:text-white"
            >
              <Ticket size={17} aria-hidden />
              Browse rooms
            </Link>
            <Link
              href="/rooms/new"
              className="clip-button inline-flex min-h-11 items-center justify-center gap-2 border border-danger-bright/70 bg-[linear-gradient(180deg,#e32636_0%,#b51622_45%,#8f1111_100%)] px-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition hover:brightness-110"
            >
              <Plus size={17} aria-hidden />
              Create room
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <TacticalPanel label="Hosted by me" className="p-5 sm:p-7">
            {!owned.length && (
              <p className="py-8 text-center font-mono text-sm text-muted">
                No rooms yet. Create the first one.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {owned.map(({ room }) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.slug}`}
                  className="block border border-border bg-background/70 p-5 transition hover:border-danger/70"
                >
                  <p className="font-display text-xl font-bold uppercase">{room.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {room.visibility === 'PUBLIC' ? 'Public room' : 'Private room'} · Manage →
                  </p>
                </Link>
              ))}
            </div>
          </TacticalPanel>

          <TacticalPanel label="Participating" className="p-5 sm:p-7">
            {!joined.length && (
              <p className="py-8 text-center font-mono text-sm text-muted">
                Not in any room yet. Browse public rooms or join with a code.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {joined.map(({ room }) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.slug}`}
                  className="block border border-border bg-background/70 p-5 transition hover:border-danger/70"
                >
                  <p className="font-display text-xl font-bold uppercase">{room.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted">Play →</p>
                </Link>
              ))}
            </div>
          </TacticalPanel>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/rooms/join"
              className="clip-button inline-flex min-h-9 items-center justify-center gap-2 border border-border-strong bg-surface px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-danger hover:text-white"
            >
              Join with a code
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
