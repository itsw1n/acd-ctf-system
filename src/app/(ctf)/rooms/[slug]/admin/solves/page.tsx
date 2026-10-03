import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireRoomOwner } from '@/features/rooms/services/requireRoom'
import { SolveFilters } from '@/features/admin/components/SolveFilters'
import {
  listSolveCategoriesForAdmin,
  listSolvesForAdmin,
} from '@/features/admin/queries/solveQueries'
import { listTeamsAdmin } from '@/features/teams/repositories/teamRepository'

export default async function RoomSolvesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ search?: string; teamId?: string; category?: string }>
}) {
  const { slug } = await params
  const { room } = await requireRoomOwner(slug)
  const query = await searchParams
  const search = query.search ?? ''
  const teamId = query.teamId ?? ''
  const category = query.category ?? ''
  const [solves, teams, categories] = await Promise.all([
    listSolvesForAdmin(room.id, { search, teamId, category }),
    listTeamsAdmin(room.id),
    listSolveCategoriesForAdmin(room.id),
  ])

  return (
    <Section data-ui="room-admin-solves">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Room admin'} · {room.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Sol<span className="text-danger-bright">ves</span>
          </h1>
        </div>

        <SolveFilters
          search={search}
          teamId={teamId}
          category={category}
          teams={teams}
          categories={categories}
        />

        <TacticalPanel label="Solve log" className="p-5 sm:p-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Player</th>
                  <th className="px-4 py-3 font-normal">Challenge</th>
                  <th className="px-4 py-3 font-normal">Team</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                  <th className="px-4 py-3 font-normal">Solved at</th>
                </tr>
              </thead>
              <tbody>
                {solves.map((solve) => (
                  <tr key={solve.id} className="border-b border-border/70 text-xs">
                    <td className="px-4 py-4 font-bold text-danger-bright">{solve.playerAlias}</td>
                    <td className="px-4 py-4">{solve.challenge}</td>
                    <td className="px-4 py-4 text-muted">{solve.team}</td>
                    <td className="px-4 py-4 text-right font-bold">{solve.pointsAwarded}</td>
                    <td className="px-4 py-4 text-muted">
                      {new Date(solve.solvedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!solves.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">No solves yet.</p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
