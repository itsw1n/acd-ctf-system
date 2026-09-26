import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { LogoMark } from '@/components/common/LogoMark'

export function PublicHeader({
  actionHref = '/signin',
  actionLabel = 'Sign in',
}: {
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <header className="mx-auto grid max-w-[1480px] grid-cols-[1fr_auto_1fr] items-center border-b border-border pb-5">
      <div className="flex items-center gap-4">
        <LogoMark />
        <span className="font-display text-2xl font-extrabold uppercase sm:text-4xl">
          ACD <span className="text-danger-bright">CTF</span>
        </span>
        <div className="hidden h-10 w-px bg-border sm:block" />
        <p className="hidden font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted sm:block">
          School Capture The Flag
          <br />
          Learn &gt; Break &gt; Solve &gt; Grow
        </p>
      </div>

      <Link
        href="/"
        className="justify-self-center font-mono text-xs uppercase tracking-[0.14em] text-muted underline-offset-4 transition hover:text-danger-bright hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
      >
        Leaderboards
      </Link>

      <div className="justify-self-end">
        <Link
          href={actionHref}
          className="flex min-h-11 items-center gap-2 border border-danger bg-danger px-4 font-mono text-xs uppercase tracking-[0.12em] text-white transition hover:bg-danger-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LogIn size={17} aria-hidden /> {actionLabel}
        </Link>
      </div>
    </header>
  )
}
