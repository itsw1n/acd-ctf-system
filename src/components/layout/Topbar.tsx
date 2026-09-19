import { ShieldAlert } from 'lucide-react'
import type { Player } from '@/features/players/types'
import { LogoMark } from '@/components/common/LogoMark'

export function Topbar({ player, score }: { player: Player; score: number }) {
  return (
    <header
      className="sticky top-0 z-40 flex min-h-[85px] items-stretch border-b border-border bg-background/95 backdrop-blur"
      data-ui="topbar"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 px-4 sm:px-7">
        <LogoMark />
        <div className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          ACD <span className="text-danger-bright">CTF</span>
        </div>
        <div className="hidden h-10 w-px bg-border md:block" />
        <div className="hidden font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted md:block">
          School Capture The Flag
          <br />
          Learn &gt; Break &gt; Solve &gt; Grow
        </div>
      </div>

      <div className="flex items-center border-l border-border px-3 sm:px-5">
        <ShieldAlert className="mr-3 hidden text-danger sm:block" size={30} aria-hidden />
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
            User // <span className="text-success">Online</span>
          </div>
          <div className="truncate font-mono text-xs font-bold text-foreground sm:text-sm">
            {player.alias}
          </div>
          <div className="hidden truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted sm:block">
            Team: {player.team?.name ?? '—'}
          </div>
        </div>
      </div>

      <div className="flex min-w-24 flex-col justify-center border-l border-border px-3 sm:min-w-36 sm:px-5">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          Total score
        </div>
        <div className="font-mono text-lg font-bold text-danger-bright sm:text-xl">{score} PTS</div>
      </div>
    </header>
  )
}
