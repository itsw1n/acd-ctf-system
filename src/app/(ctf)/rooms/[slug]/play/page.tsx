import { redirect } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { requireRoomMember } from '@/features/rooms/services/requireRoom'
import { listChallengesForPlayer } from '@/features/challenges/queries/challengePlayerQueries'
import { ChallengeCards } from '@/features/challenges/components/ChallengeCards'

export default async function RoomPlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { player, room, membership } = await requireRoomMember(slug)
  if (membership.role !== 'PARTICIPANT') redirect(`/rooms/${slug}/admin`)

  const challenges = await listChallengesForPlayer(player.id, room.id)

  return (
    <Section data-ui="room-play">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Room'} · {room.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Solve <span className="text-danger-bright">challenges</span>
          </h1>
        </div>

        <TacticalPanel label="Active challenges" className="p-5 sm:p-7">
          <ChallengeCards challenges={challenges} roomId={room.id} />
        </TacticalPanel>
      </Container>
    </Section>
  )
}
