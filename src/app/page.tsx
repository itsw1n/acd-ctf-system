import { redirect } from 'next/navigation'
import { ShieldAlert, Skull } from 'lucide-react'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'
import { listTeams } from '@/features/players/repositories/playerRepository'
import { JoinAccess } from '@/features/players/components/JoinAccess'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export default async function AccessPage() {
  const currentPlayer = await getCurrentPlayer()
  if (currentPlayer) redirect('/dashboard')

  const teams = await listTeams()

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground tactical-grid scanlines sm:px-6 lg:px-10">
      <header className="mx-auto flex max-w-[1480px] items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <div className="font-display text-2xl font-extrabold uppercase sm:text-4xl">
            ACD <span className="text-danger-bright">CTF</span>
          </div>
          <div className="hidden h-10 w-px bg-border sm:block" />
          <div className="hidden font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted sm:block">
            School Capture The Flag
            <br />
            Learn &gt; Break &gt; Solve &gt; Grow
          </div>
        </div>
        <ShieldAlert className="text-danger" size={30} aria-label="CTF security emblem" />
      </header>

      <Section className="py-10 sm:py-16" data-ui="access">
        <Container className="max-w-[1280px]">
          <div className="mb-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {'// Access'}
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-6xl">
                Enter the <span className="text-danger-bright">CTF</span>
              </h1>
              <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
                Solve problems. Build skills. Join a brighter tomorrow.
              </p>
            </div>
            <div className="hidden items-center gap-3 border-l border-border pl-5 md:flex">
              <Skull className="text-border-strong" size={54} aria-hidden />
              <div className="font-mono text-[10px] uppercase leading-5 tracking-[0.13em] text-muted">
                More than a competition
                <br />
                Students. Skills. Opportunity.
              </div>
            </div>
          </div>

          <JoinAccess teams={teams} />
        </Container>
      </Section>

      <footer className="mx-auto max-w-[1480px] border-t border-border py-5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted/70">
        “Curiosity breaches. Practice secures.”
      </footer>
    </main>
  )
}
