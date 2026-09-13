import { ShieldCheck } from 'lucide-react'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'
import { logoutPlayer } from '@/features/players/actions/playerActions'

export default async function ProfilePage() {
  const player = await requireCurrentPlayer()

  const rows = [
    ['Full name', player.fullName],
    ['Alias', player.alias],
    ['Team', player.team.name],
  ]

  return (
    <Section data-ui="profile">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Profile'}</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none sm:text-7xl">
            Profile
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Participant identity details
          </p>
        </div>

        <TacticalPanel label="User profile" className="p-5 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div className="flex aspect-square max-w-[220px] items-center justify-center border border-danger bg-[radial-gradient(circle,rgba(143,17,17,.23),transparent_65%)]">
              <ShieldCheck className="text-danger-bright" size={96} strokeWidth={1.3} aria-hidden />
            </div>

            <div className="space-y-3">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 border border-border bg-background/72 px-5 py-4 sm:grid-cols-[190px_1fr] sm:items-center"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.11em] text-muted">
                    {label}
                  </span>
                  <span className="font-mono text-base text-foreground sm:text-lg">
                    <span className="mr-4 hidden text-danger sm:inline">{'//'}</span>
                    {value}
                  </span>
                </div>
              ))}

              <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-[10px] leading-5 text-muted">
                  Recovery is handled through your secure browser session and recovery code.
                </p>
                <form action={logoutPlayer}>
                  <button
                    type="submit"
                    className="clip-button border border-border-strong bg-background px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted transition hover:border-danger hover:text-danger-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                  >
                    End session
                  </button>
                </form>
              </div>
            </div>
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
