import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { listMyRooms, listPublicRooms } from '@/features/rooms/services/roomService'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

export default async function RootPage() {
  const player = await getCurrentPlayer()
  const rooms = await listPublicRooms()
  const memberRoomIds = new Set<string>()
  if (player) {
    const memberships = await listMyRooms(player.id)
    for (const membership of memberships) memberRoomIds.add(membership.room.id)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground tactical-grid scanlines sm:px-6 lg:px-10">
      <PublicHeader />

      <Container className="max-w-[1380px] py-10 sm:py-14">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Find a <span className="text-danger-bright">room</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Public rooms anyone can join. Sign in to join and play.
          </p>
        </div>

        <TacticalPanel label="Public rooms" className="p-5 sm:p-7">
          {!rooms.length && (
            <p className="py-8 text-center font-mono text-sm text-muted">
              No public rooms yet. Check back soon.
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
    </main>
  )
}
