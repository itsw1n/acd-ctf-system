import { ChevronDown, Search } from 'lucide-react'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Input } from '@/components/common/Input'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { listSolvesForAdmin } from '@/features/solves/queries/solveAdminQueries'
import { listTeamsAdmin } from '@/features/teams/repositories/teamRepository'

export default async function AdminSolvesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; teamId?: string; category?: string }>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const teamId = params.teamId ?? ''
  const category = params.category ?? ''
  const [solves, teams] = await Promise.all([
    listSolvesForAdmin({ search, teamId, category }),
    listTeamsAdmin(),
  ])

  return (
    <Section data-ui="admin-solves">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Admin'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Sol<span className="text-danger-bright">ves</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Read-only solve log
          </p>
        </div>

        <TacticalPanel label="Solves" className="p-5 sm:p-7">
          <form
            method="get"
            className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]"
          >
            <div className="relative">
              <Search
                size={16}
                aria-hidden
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search player, alias, or challenge"
                className="pl-11"
                aria-label="Search solves"
              />
            </div>
            <div className="relative">
              <select
                name="teamId"
                defaultValue={teamId}
                aria-label="Filter by team"
                className="clip-input h-12 w-full appearance-none border border-border-strong bg-background/90 pl-4 pr-11 font-mono text-sm text-foreground outline-none transition focus:border-danger"
              >
                <option value="">All teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-danger"
              />
            </div>
            <Input
              name="category"
              defaultValue={category}
              placeholder="Category filter"
              aria-label="Filter by category"
            />
            <button
              type="submit"
              className="clip-button inline-flex min-h-12 items-center justify-center border border-border-strong bg-surface px-6 font-display text-sm font-semibold uppercase tracking-[0.14em] hover:border-danger"
            >
              Filter
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Alias</th>
                  <th className="px-4 py-3 font-normal">Full name</th>
                  <th className="px-4 py-3 font-normal">Team</th>
                  <th className="px-4 py-3 font-normal">Challenge</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                  <th className="px-4 py-3 font-normal">Solved at</th>
                </tr>
              </thead>
              <tbody>
                {solves.map((solve) => (
                  <tr key={solve.id} className="border-b border-border/70 text-xs">
                    <td className="px-4 py-4 font-bold text-danger-bright">{solve.playerAlias}</td>
                    <td className="px-4 py-4">{solve.fullName}</td>
                    <td className="px-4 py-4 text-muted">{solve.team}</td>
                    <td className="px-4 py-4">{solve.challenge}</td>
                    <td className="px-4 py-4 text-muted">{solve.category}</td>
                    <td className="px-4 py-4 text-right font-bold text-danger-bright">
                      +{solve.pointsAwarded}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {new Date(solve.solvedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!solves.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">No solves found.</p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
