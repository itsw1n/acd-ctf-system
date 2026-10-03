import type { ReactNode } from 'react'
import type { Player } from '@/features/players/types'
import { logoutAction } from '@/features/auth/actions/authActions'
import { Navigation } from '@/components/layout/Navigation'
import { Topbar } from '@/components/layout/Topbar'

export function AppShell({
  player,
  score,
  children,
}: {
  player: Player
  score: number | null
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground tactical-grid scanlines lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <Topbar player={player} score={score} />
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <Navigation logoutAction={logoutAction} />
        <main className="min-w-0 pb-24 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-10">
          {children}
          <footer className="border-t border-border px-5 py-4 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted/70">
            © itsw1n
          </footer>
        </main>
      </div>
    </div>
  )
}
