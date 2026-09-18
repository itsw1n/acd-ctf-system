import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createChallengeAction } from '@/features/challenges/actions/challengeActions'
import { ChallengeForm } from '@/features/challenges/components/ChallengeForm'

export default function NewChallengePage() {
  return (
    <Section data-ui="admin-challenge-new">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Admin'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            New <span className="text-danger-bright">Challenge</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            The flag is retained for admin recovery and hashed for player submissions.
          </p>
        </div>

        <ChallengeForm mode="create" action={createChallengeAction} />
      </Container>
    </Section>
  )
}
