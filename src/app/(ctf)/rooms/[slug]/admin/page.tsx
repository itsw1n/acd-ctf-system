import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { requireRoomOwner } from '@/features/rooms/services/requireRoom'
import { getAdminOverview } from '@/features/admin/queries/overviewQueries'
import {
  regenerateJoinCodeAction,
  setJoinLockedAction,
  updateRoomAction,
} from '@/features/rooms/actions/roomActions'
import { RoomSettingsForm } from '@/features/rooms/components/RoomSettingsForm'
import { JoinCodePanel } from '@/features/rooms/components/JoinCodePanel'
import { JoinLockControl } from '@/features/rooms/components/JoinLockControl'
import { getRoomJoinCode } from '@/features/rooms/services/roomService'

export default async function RoomAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { room } = await requireRoomOwner(slug)
  const [overview, joinCode] = await Promise.all([
    getAdminOverview(room.id),
    getRoomJoinCode(room.id),
  ])

  const stats = [
    { label: 'Participants', value: String(overview.totalPlayers) },
    { label: 'Teams', value: String(overview.totalTeams) },
    { label: 'Active challenges', value: String(overview.activeChallenges) },
    { label: 'Solves', value: String(overview.totalSolves) },
  ]

  return (
    <Section data-ui="room-admin">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Room admin'} · {room.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Room <span className="text-danger-bright">overview</span>
          </h1>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-border bg-surface/88 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold">{stat.value}</p>
              </div>
            ))}
          </div>

          <RoomSettingsForm room={room} action={updateRoomAction.bind(null, room.id)} />
          <JoinCodePanel roomId={room.id} code={joinCode} action={regenerateJoinCodeAction} />
          <JoinLockControl roomId={room.id} locked={room.joinLocked} action={setJoinLockedAction} />

          <TacticalPanel label="Top players" className="p-5 sm:p-7">
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
                  {overview.leaderboards.playerRanks.slice(0, 5).map((rank) => (
                    <tr key={rank.playerId} className="border-b border-border/70 text-xs">
                      <td className="px-4 py-4 font-bold text-danger-bright">{rank.alias}</td>
                      <td className="px-4 py-4 text-muted">{rank.team}</td>
                      <td className="px-4 py-4 text-right font-bold">{rank.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!overview.leaderboards.playerRanks.length && (
                <p className="py-14 text-center font-mono text-sm text-muted">No solves yet.</p>
              )}
            </div>
          </TacticalPanel>
        </div>
      </Container>
    </Section>
  )
}
