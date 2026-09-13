import { Crosshair, Star } from 'lucide-react'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { getPlayerActivity } from '@/features/activity/queries/activityQueries'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

export default async function ActivityPage() {
  const player = await requireCurrentPlayer()
  const activity = await getPlayerActivity(player.id)
  const totalPoints = activity.reduce((sum, row) => sum + row.points, 0)

  return (
    <Section data-ui="activity">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Activity'}
          </p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none sm:text-7xl">
            My <span className="text-danger-bright">Activity</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Your solve and point history
          </p>
        </div>

        <TacticalPanel label="Solve history" className="p-5 sm:p-7">
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:ml-auto lg:max-w-xl">
            <div className="flex items-center gap-4 border border-border-strong bg-background/75 p-4">
              <Crosshair className="text-muted" aria-hidden />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
                  Total solves
                </div>
                <div className="font-mono text-2xl font-bold">{activity.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 border border-danger/45 bg-primary/5 p-4">
              <Star className="text-danger" aria-hidden />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
                  Total points
                </div>
                <div className="font-mono text-2xl font-bold text-danger-bright">
                  {totalPoints} PTS
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Time</th>
                  <th className="px-4 py-3 font-normal">Challenge</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 font-normal">Result</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className="border-b border-border/70 text-xs text-foreground">
                    <td className="px-4 py-4 text-muted">
                      {new Date(row.solvedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">{row.challenge}</td>
                    <td className="px-4 py-4 text-muted">{row.category}</td>
                    <td className="px-4 py-4 text-success">[✓] SOLVED</td>
                    <td className="px-4 py-4 text-right font-bold text-danger-bright">
                      +{row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!activity.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">
                No solves yet. Submit your first flag from the dashboard.
              </p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
