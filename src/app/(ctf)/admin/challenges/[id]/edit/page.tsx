import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { updateChallengeAction } from '@/features/challenges/actions/challengeActions'
import { ChallengeForm } from '@/features/challenges/components/ChallengeForm'
import { getChallengeForAdminEdit } from '@/features/challenges/queries/challengeAdminQueries'

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const challenge = await getChallengeForAdminEdit(id)
  if (!challenge) notFound()

  return (
    <Section data-ui="admin-challenge-edit">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Admin'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Edit <span className="text-danger-bright">Challenge</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            The current flag is loaded into the editable field. Change it when needed.
          </p>
        </div>

        <ChallengeForm mode="edit" initial={challenge} action={updateChallengeAction} />
      </Container>
    </Section>
  )
}
