import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { LeaveRoomForm } from '@/features/rooms/components/LeaveRoomForm'
import { requireRoomMember } from '@/features/rooms/services/requireRoom'
import { leaveRoomAction } from '@/features/rooms/actions/roomActions'
import { getLeaderboards } from '@/features/leaderboard/queries/leaderboardQueries'
import { getPlayerScore } from '@/features/activity/queries/activityQueries'
import { cn } from '@/lib/cn'

export default async function RoomOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { player, room, membership } = await requireRoomMember(slug)
  const role: 'OWNER' | 'PARTICIPANT' = membership.role
  if (role === 'OWNER') redirect(`/rooms/${slug}/admin`)
  const [boards, score] = await Promise.all([
    getLeaderboards(room.id),
    getPlayerScore(player.id, room.id),
  ])

  return (
    <Section data-ui="room-overview">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Room'} · {membership.role === 'OWNER' ? 'Owner' : 'Participant'}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            {room.name}
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Your score: <span className="font-bold text-danger-bright">{score} PTS</span>
          </p>
          {membership.role !== 'OWNER' && (
            <LeaveRoomForm action={leaveRoomAction.bind(null, room.id)} />
          )}
        </div>

        <TacticalPanel label="Room leaderboard" className="p-5 sm:p-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Player</th>
                  <th className="px-4 py-3 font-normal">Team</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                </tr>
              </thead>
              <tbody>
                {boards.playerRanks.map((rank) => (
                  <tr
                    key={rank.playerId}
                    className={cn(
                      'border-b border-border/70 text-xs',
                      rank.playerId === player.id && 'bg-primary/10'
                    )}
                  >
                    <td className="px-4 py-4 font-bold text-danger-bright">{rank.alias}</td>
                    <td className="px-4 py-4 text-muted">{rank.team}</td>
                    <td className="px-4 py-4 text-right font-bold">{rank.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!boards.playerRanks.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">
                No solves yet. Be the first.
              </p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
