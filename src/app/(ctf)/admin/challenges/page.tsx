import Link from 'next/link'
import { Pencil, Plus } from 'lucide-react'

import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { toggleChallengeActiveAction } from '@/features/challenges/actions/challengeActions'
import { listChallengesForAdmin } from '@/features/challenges/queries/challengeAdminQueries'
import { cn } from '@/lib/cn'

export default async function AdminChallengesPage() {
  const challenges = await listChallengesForAdmin()

  return (
    <Section data-ui="admin-challenges">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Admin'}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              Chall<span className="text-danger-bright">enges</span>
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Manage challenge metadata and flags.
            </p>
          </div>
          <Link
            href="/admin/challenges/new"
            className="clip-button relative inline-flex min-h-11 items-center justify-center gap-2 border border-danger-bright/70 bg-[linear-gradient(180deg,#e32636_0%,#b51622_45%,#8f1111_100%)] px-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition hover:brightness-110 w-full sm:w-auto"
          >
            <Plus size={18} aria-hidden />
            Create challenge
          </Link>
        </div>

        <TacticalPanel label="Challenge list" className="p-5 sm:p-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Title</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 font-normal">Type</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Created at</th>
                  <th className="px-4 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="border-b border-border/70 text-xs">
                    <td className="max-w-[240px] truncate px-4 py-4 font-semibold">
                      {challenge.title}
                    </td>
                    <td className="px-4 py-4 text-muted">{challenge.category}</td>
                    <td className="px-4 py-4">{challenge.type}</td>
                    <td className="px-4 py-4 text-right font-bold text-danger-bright">
                      {challenge.points}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.12em]',
                          challenge.active
                            ? 'border-success/60 bg-success/5 text-success'
                            : 'border-muted/60 bg-background text-muted'
                        )}
                      >
                        {challenge.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {new Date(challenge.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/challenges/${challenge.id}/edit`}
                          className="clip-button relative inline-flex min-h-9 items-center justify-center gap-2 border border-border-strong bg-surface px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-danger hover:text-white"
                        >
                          <Pencil size={14} aria-hidden />
                          Edit
                        </Link>
                        <form action={toggleChallengeActiveAction}>
                          <input type="hidden" name="id" value={challenge.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={challenge.active ? 'false' : 'true'}
                          />
                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            {challenge.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!challenges.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">
                No challenges yet. Create the first one.
              </p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
