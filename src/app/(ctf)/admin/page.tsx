import { Crown, Flag, Star, Trophy, Users } from 'lucide-react'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { getAdminOverview } from '@/features/admin/queries/overviewQueries'
import { getSignupLock } from '@/features/competition/repositories/competitionRepository'
import { SignupLockControl } from '@/features/competition/components/SignupLockControl'

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview()
  const locked = await getSignupLock()

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

        <div className="mt-5">
          <SignupLockControl locked={locked} />
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

        <TacticalPanel label="Leaderboards" className="mt-5 p-5 sm:p-7">
          <div className="grid gap-5 min-[1500px]:grid-cols-2">
            <div className="overflow-x-auto">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                <Crown size={15} className="text-warning" aria-hidden /> Team rankings
              </h2>
              <table className="w-full min-w-[360px] border-collapse text-left font-mono">
                <thead>
                  <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                    <th className="px-4 py-3 font-normal">Rank</th>
                    <th className="px-4 py-3 font-normal">Team</th>
                    <th className="px-4 py-3 text-right font-normal">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.leaderboards.teamRanks.map((row, index) => (
                    <tr key={row.teamId} className="border-b border-border/70 text-xs">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold">{row.team}</td>
                      <td className="px-4 py-3 text-right font-bold text-danger-bright">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                <Trophy size={15} className="text-danger" aria-hidden /> Player rankings
              </h2>
              <table className="w-full min-w-[420px] border-collapse text-left font-mono">
                <thead>
                  <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                    <th className="px-4 py-3 font-normal">Rank</th>
                    <th className="px-4 py-3 font-normal">Player</th>
                    <th className="px-4 py-3 font-normal">Team</th>
                    <th className="px-4 py-3 text-right font-normal">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.leaderboards.playerRanks.map((row, index) => (
                    <tr key={row.playerId} className="border-b border-border/70 text-xs">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold">{row.alias}</td>
                      <td className="truncate px-4 py-3 text-muted">{row.team}</td>
                      <td className="px-4 py-3 text-right font-bold text-danger-bright">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
