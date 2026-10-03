import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const currentPlayer = await getCurrentPlayer()
  if (currentPlayer) redirect('/rooms')
  const params = await searchParams

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground tactical-grid scanlines sm:px-6 lg:px-10">
      <PublicHeader actionHref="/signup" actionLabel="Sign up" />

      <Section className="py-10 sm:py-16" data-ui="signin">
        <Container className="max-w-[1280px]">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {'// Access'}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-6xl">
              Enter the <span className="text-danger-bright">CTF</span>
            </h1>
            <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Sign in with your alias and password.
            </p>
          </div>

          <SignInForm resetSuccess={params.reset === '1'} />
        </Container>
      </Section>

      <footer className="mx-auto max-w-[1480px] border-t border-border py-5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted/70">
        “Curiosity breaches. Practice secures.”
      </footer>
    </main>
  )
}
