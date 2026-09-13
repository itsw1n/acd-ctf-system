import { Crown, Flag, Star, Users } from 'lucide-react'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { getAdminOverview } from '@/features/admin/queries/overviewQueries'

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview()

  const stats = [
    { label: 'Total players', value: String(overview.totalPlayers), icon: Users },
    { label: 'Total teams', value: String(overview.totalTeams), icon: Flag },
    { label: 'Active challenges', value: String(overview.activeChallenges), icon: Star },
    { label: 'Total solves', value: String(overview.totalSolves), icon: Crown },
  ]

  return (
    <Section data-ui="admin-overview">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Admin'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Competition <span className="text-danger-bright">Overview</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Operational status at a glance
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 border border-border bg-background/75 p-4"
            >
              <Icon size={20} className="shrink-0 text-danger" aria-hidden />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
                  {label}
                </div>
                <div className="font-mono text-2xl font-bold">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 min-[1500px]:grid-cols-2">
          <TacticalPanel label="Leading team" className="min-w-0 p-5 sm:p-7">
            {overview.leadingTeam ? (
              <div className="flex items-center gap-4 border border-warning/65 bg-warning/5 p-4">
                <Crown size={22} className="shrink-0 text-warning" aria-hidden />
                <div className="min-w-0">
                  <div className="truncate font-mono text-lg font-bold text-warning">
                    {overview.leadingTeam.name}
                  </div>
                  <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {overview.leadingTeam.points} PTS
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center font-mono text-sm text-muted">No scores yet.</p>
            )}
          </TacticalPanel>

          <TacticalPanel label="Recent solves" className="min-w-0 p-5 sm:p-7">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left font-mono">
                <thead>
                  <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                    <th className="px-4 py-3 font-normal">Player</th>
                    <th className="px-4 py-3 font-normal">Challenge</th>
                    <th className="px-4 py-3 text-right font-normal">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentSolves.map((row) => (
                    <tr key={row.id} className="border-b border-border/70 text-xs">
                      <td className="px-4 py-3">{row.playerAlias}</td>
                      <td className="truncate px-4 py-3 text-muted">{row.challenge}</td>
                      <td className="px-4 py-3 text-right font-bold text-danger-bright">
                        +{row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!overview.recentSolves.length && (
                <p className="py-8 text-center font-mono text-sm text-muted">No solves yet.</p>
              )}
            </div>
          </TacticalPanel>
        </div>
      </Container>
    </Section>
  )
}
