import { notFound, redirect } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireAccount } from '@/features/rooms/services/requireRoom'
import { getRoomBySlug } from '@/features/rooms/repositories/roomRepository'
import { joinRoomAction } from '@/features/rooms/actions/roomActions'
import { listTeamsAdmin } from '@/features/teams/repositories/teamRepository'
import { JoinRoomForm } from '@/features/rooms/components/JoinRoomForm'

export default async function RoomJoinPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAccount()
  const { slug } = await params
  const room = await getRoomBySlug(slug)
  if (!room) notFound()
  if (room.visibility === 'PRIVATE') redirect('/rooms/join')

  const teams = await listTeamsAdmin(room.id)

  return (
    <Section data-ui="room-join">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Join a <span className="text-danger-bright">room</span>
          </h1>
        </div>

        <JoinRoomForm
          roomName={room.name}
          teams={teams}
          action={joinRoomAction.bind(null, room.id)}
        />
      </Container>
    </Section>
  )
}
