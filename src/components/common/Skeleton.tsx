import { cn } from '@/lib/cn'

/**
 * Skeleton loading primitives. Block shimmer in design-system tones
 * (no spinners) for route loading fallbacks. Widths are deterministic
 * (no random values) so server and client render identically.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-sm bg-border/50', className)} />
}

const ROW_WIDTHS = ['w-11/12', 'w-full', 'w-10/12', 'w-full', 'w-9/12', 'w-full'] as const

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px] space-y-0">
        <div className="border-y border-border bg-background/70 px-4 py-3">
          <Skeleton className="h-3 w-2/12" />
        </div>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="border-b border-border/70 px-4 py-4">
            <Skeleton className={cn('h-4', ROW_WIDTHS[index % ROW_WIDTHS.length])} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="border border-border bg-surface/88 p-5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-3 h-7 w-1/3" />
        </div>
      ))}
    </div>
  )
}
