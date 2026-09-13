import type { ReactNode } from 'react'
import type { Player } from '@/features/players/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export function AppShell({
  player,
  score,
  children,
}: {
  player: Player
  score: number
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground tactical-grid scanlines">
      <Topbar player={player} score={score} />
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar />
        <main className="min-w-0 pb-24 lg:pb-10">{children}</main>
      </div>
    </div>
  )
}
