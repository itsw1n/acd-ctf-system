import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

export default async function ForgotPasswordPage() {
  const currentPlayer = await getCurrentPlayer()
  if (currentPlayer) redirect(currentPlayer.role === 'ADMIN' ? '/admin' : '/dashboard')

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

      <Section className="py-10 sm:py-16" data-ui="forgot-password">
        <Container className="max-w-[1280px]">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {'// Recovery'}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-6xl">
              Reset <span className="text-danger-bright">password</span>
            </h1>
            <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Verify your recovery code, then choose a new password.
            </p>
          </div>

          <ResetPasswordForm />
        </Container>
      </Section>

      <footer className="mx-auto max-w-[1480px] border-t border-border py-5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted/70">
        “Curiosity breaches. Practice secures.”
      </footer>
    </main>
  )
}
