import { AlertTriangle } from 'lucide-react'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requirePlayer } from '@/features/auth/services/requirePlayer'
import { ChallengeCards } from '@/features/challenges/components/ChallengeCards'
import { listChallengesForPlayer } from '@/features/challenges/queries/challengePlayerQueries'

export default async function ChallengesPage() {
  const player = await requirePlayer()
  const challenges = await listChallengesForPlayer(player.id)

  return (
    <Section data-ui="challenges">
      <Container>
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Challenge board'}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
            Solve <span className="text-danger-bright">Challenges</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Search and filter problems, then open a card to view its details.
          </p>
        </div>

        <TacticalPanel label="Active challenges" className="p-5 sm:p-7">
          <ChallengeCards challenges={challenges} />
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex max-w-2xl gap-4">
              <AlertTriangle className="mt-0.5 shrink-0 text-danger" size={30} aria-hidden />
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-danger-bright">
                  {'// Operational security'}
                </h2>
                <p className="mt-2 font-mono text-[11px] uppercase leading-5 tracking-[0.09em] text-muted">
                  Flags are checked on the server. Duplicate solves never award points twice.
                </p>
              </div>
            </div>
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
