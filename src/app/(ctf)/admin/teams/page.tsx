import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createTeamAction, renameTeamAction } from '@/features/teams/actions/teamActions'
import { CreateTeamForm } from '@/features/teams/components/TeamForms'
import { RenameTeamDialog } from '@/features/teams/components/TeamDialogs'
import { listTeamsWithStats } from '@/features/teams/queries/teamAdminQueries'

export default async function AdminTeamsPage() {
  const teams = await listTeamsWithStats()

  return (
    <Section data-ui="admin-teams">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Admin'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Te<span className="text-danger-bright">ams</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Create teams and edit team names
          </p>
        </div>

        <div className="grid gap-5">
          <CreateTeamForm action={createTeamAction} />

          <TacticalPanel label="Manage teams" className="p-5 sm:p-7">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left font-mono">
                <thead>
                  <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                    <th className="w-12 px-4 py-3 font-normal">#</th>
                    <th className="px-4 py-3 font-normal">Team name</th>
                    <th className="px-4 py-3 font-normal">Members</th>
                    <th className="px-4 py-3 text-right font-normal">Score</th>
                    <th className="px-4 py-3 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team.id} className="border-b border-border/70 text-xs">
                      <td className="px-4 py-4 text-muted">{index + 1}</td>
                      <td className="px-4 py-4 font-semibold">{team.name}</td>
                      <td className="px-4 py-4">{team.memberCount}</td>
                      <td className="px-4 py-4 text-right font-bold text-danger-bright">
                        {team.score}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <RenameTeamDialog
                          teamId={team.id}
                          teamName={team.name}
                          action={renameTeamAction}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!teams.length && (
                <p className="py-14 text-center font-mono text-sm text-muted">No teams yet.</p>
              )}
            </div>
          </TacticalPanel>
        </div>
      </Container>
    </Section>
  )
}
