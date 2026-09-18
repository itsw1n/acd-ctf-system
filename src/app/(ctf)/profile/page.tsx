import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requirePlayer } from '@/features/admin/services/requirePlayer'
import { logoutAction } from '@/features/auth/actions/authActions'

export default async function ProfilePage() {
  const player = await requirePlayer()

  const rows: Array<{ label: string; value: string; tone?: 'default' | 'success' }> = [
    { label: 'Full name', value: player.fullName },
    { label: 'Team', value: player.team?.name ?? '—' },
    { label: 'Role', value: player.role },
    // Rendered only with a valid session, so presence here means active.
    { label: 'Session', value: 'ACTIVE', tone: 'success' },
  ]

  return (
    <Section data-ui="profile">
      <Container>
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Profile'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Profile
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Participant identity details
          </p>
        </div>

        <TacticalPanel label="Participant identity" className="p-5 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div
              aria-hidden
              className="flex aspect-square w-full max-w-[220px] items-center justify-center border border-danger bg-[radial-gradient(circle,rgba(143,17,17,.23),transparent_65%)]"
            >
              <ShieldCheck className="text-danger-bright" size={96} strokeWidth={1.3} />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Operator alias
              </p>
              <p className="mt-1 truncate font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
                {player.alias}
              </p>

              <div className="mt-5 space-y-3">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-1 border border-border bg-background/72 px-5 py-4 sm:grid-cols-[190px_1fr] sm:items-center"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.11em] text-muted">
                      {row.label}
                    </span>
                    <span
                      className={
                        row.tone === 'success'
                          ? 'font-mono text-base text-success sm:text-lg'
                          : 'font-mono text-base text-foreground sm:text-lg'
                      }
                    >
                      <span className="mr-4 hidden text-danger sm:inline" aria-hidden>
                        {'//'}
                      </span>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-[10px] leading-5 text-muted">
                  Recovery is handled through your secure browser session and recovery code.
                </p>
                <form action={logoutAction}>
                  <Button type="submit" className="w-full sm:w-auto">
                    End session
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
