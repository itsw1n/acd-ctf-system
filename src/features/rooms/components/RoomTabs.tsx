'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'

export function RoomTabs({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const pathname = usePathname()
  const base = `/rooms/${slug}`
  const links = [
    ...(isOwner
      ? [
          { href: `${base}/admin`, label: 'Overview' },
          { href: `${base}/admin/challenges`, label: 'Challenges' },
          { href: `${base}/admin/teams`, label: 'Teams' },
          { href: `${base}/admin/members`, label: 'Members' },
          { href: `${base}/admin/solves`, label: 'Solves' },
        ]
      : [
          { href: base, label: 'Leaderboard' },
          { href: `${base}/play`, label: 'Play' },
          { href: `${base}/activity`, label: 'Activity' },
        ]),
  ]

  return (
    <nav
      aria-label="Room navigation"
      className="overflow-x-auto border border-border bg-background/75"
      data-ui="room-tabs"
    >
      <div className="flex min-w-max">
        {links.map(({ href, label }) => {
          const active = pathname === href || (href !== base && pathname.startsWith(`${href}/`))
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'border-r border-border/60 px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-muted transition hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger',
                active && 'bg-primary/15 text-danger-bright'
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
