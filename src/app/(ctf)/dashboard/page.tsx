import { AlertTriangle } from 'lucide-react'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { FlagSubmissionForm } from '@/features/flags/components/FlagSubmissionForm'

export default function DashboardPage() {
  return (
    <Section data-ui="dashboard">
      <Container>
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Flag submission'}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
            Submit <span className="text-danger-bright">Flag</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Enter a valid flag to earn points for your team
          </p>
        </div>

        <TacticalPanel label="Flag submission // Global" className="p-5 sm:p-7">
          <div className="border border-danger/25 bg-primary/[0.07] p-4 sm:p-6">
            <FlagSubmissionForm />
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex max-w-2xl gap-4">
              <AlertTriangle className="mt-0.5 shrink-0 text-danger" size={30} aria-hidden />
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-danger-bright">
                  {'// Operational security'}
                </h2>
                <p className="mt-2 font-mono text-[11px] uppercase leading-5 tracking-[0.09em] text-muted">
                  Submit only challenge flags through this field. Duplicate solves never award
                  points twice.
                </p>
              </div>
            </div>
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
