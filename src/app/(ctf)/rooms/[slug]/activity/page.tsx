import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { requireRoomMember } from '@/features/rooms/services/requireRoom'
import { getPlayerActivity } from '@/features/activity/queries/activityQueries'

export default async function RoomActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { player, room, membership } = await requireRoomMember(slug)
  if (membership.role === 'OWNER') redirect(`/rooms/${slug}/admin`)
  const activity = await getPlayerActivity(player.id, room.id)
  const totalPoints = activity.reduce((sum, row) => sum + row.points, 0)

  return (
    <Section data-ui="room-activity">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Room'} · {room.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            My <span className="text-danger-bright">activity</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            {activity.length} solves · {totalPoints} PTS in this room
          </p>
        </div>

        <TacticalPanel label="Solve history" className="p-5 sm:p-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Challenge</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                  <th className="px-4 py-3 font-normal">Solved at</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className="border-b border-border/70 text-xs">
                    <td className="px-4 py-4 font-semibold">{row.challenge}</td>
                    <td className="px-4 py-4 text-muted">{row.category}</td>
                    <td className="px-4 py-4 text-right font-bold text-danger-bright">
                      {row.points}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {new Date(row.solvedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!activity.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">
                No solves in this room yet.
              </p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
