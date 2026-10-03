import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

export default async function SignUpPage() {
  const currentPlayer = await getCurrentPlayer()
  if (currentPlayer) redirect('/rooms')

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground tactical-grid scanlines sm:px-6 lg:px-10">
      <PublicHeader actionHref="/signin" actionLabel="Sign in" />

      <Section className="py-10 sm:py-16" data-ui="signup">
        <Container className="max-w-[1280px]">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {'// Register'}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-6xl">
              Create <span className="text-danger-bright">account</span>
            </h1>
            <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Solve problems. Build skills. Join a brighter tomorrow.
            </p>
          </div>

          <SignUpForm />
        </Container>
      </Section>

      <footer className="mx-auto max-w-[1480px] border-t border-border py-5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted/70">
        “Curiosity breaches. Practice secures.”
      </footer>
    </main>
  )
}
