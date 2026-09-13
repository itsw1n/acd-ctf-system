import { Crown } from 'lucide-react'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { getLeaderboards } from '@/features/leaderboard/queries/leaderboardQueries'
import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'
import { cn } from '@/lib/cn'

export default async function LeaderboardPage() {
  const [player, boards] = await Promise.all([requireCurrentPlayer(), getLeaderboards()])

  return (
    <Section data-ui="leaderboard">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Leaderboard'}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Leader<span className="text-danger-bright">board</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            Track team and player rankings
          </p>
        </div>

        <div className="grid gap-5 min-[1500px]:grid-cols-2">
          <TacticalPanel label="Team leaderboard" className="min-w-0 p-5 sm:p-7">
            <div className="overflow-x-auto pt-3">
              <div className="min-w-[560px] space-y-2">
              <div className="grid grid-cols-[64px_1fr_90px] border border-border bg-background/75 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
                <span>Rank</span>
                <span>Team</span>
                <span className="text-right">Points</span>
              </div>
              {boards.teamRanks.map((row, index) => (
                <div
                  key={row.teamId}
                  className={cn(
                    'grid grid-cols-[64px_1fr_90px] items-center border border-border px-3 py-4 font-mono text-sm',
                    index === 0 && 'border-warning/65 bg-warning/5 text-warning'
                  )}
                >
                  <span className="font-bold">{index + 1}</span>
                  <span className="flex items-center gap-2 font-semibold">
                    {index === 0 && <Crown size={16} aria-hidden />}
                    {row.team}
                  </span>
                  <span className="text-right font-bold">{row.points}</span>
                </div>
              ))}
              </div>
            </div>
          </TacticalPanel>

          <TacticalPanel label="Player leaderboard" className="min-w-0 p-5 sm:p-7">
            <div className="overflow-x-auto pt-3">
              <div className="min-w-[620px] space-y-2">
              <div className="grid grid-cols-[55px_1fr_1fr_72px] border border-border bg-background/75 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
                <span>Rank</span>
                <span>Alias</span>
                <span>Team</span>
                <span className="text-right">PTS</span>
              </div>
              {boards.playerRanks.map((row, index) => (
                <div
                  key={row.playerId}
                  className={cn(
                    'grid grid-cols-[55px_1fr_1fr_72px] items-center border border-border px-3 py-4 font-mono text-xs sm:text-sm',
                    row.playerId === player.id &&
                      'border-danger bg-primary/12 text-danger-bright shadow-[inset_3px_0_0_var(--color-danger)]'
                  )}
                >
                  <span>{index + 1}</span>
                  <span className="truncate font-semibold">{row.alias}</span>
                  <span className="truncate">{row.team}</span>
                  <span className="text-right font-bold">{row.points}</span>
                </div>
              ))}
              </div>
            </div>
          </TacticalPanel>
        </div>
      </Container>
    </Section>
  )
}
