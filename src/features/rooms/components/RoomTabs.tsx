'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'

export function RoomTabs({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const pathname = usePathname()
  const links = [
    { href: `/rooms/${slug}`, label: 'Overview' },
    { href: `/rooms/${slug}/play`, label: 'Play' },
    { href: `/rooms/${slug}/activity`, label: 'Activity' },
    ...(isOwner ? [{ href: `/rooms/${slug}/admin`, label: 'Admin' }] : []),
  ]

  return (
    <nav
      aria-label="Room navigation"
      className="overflow-x-auto border border-border bg-background/75"
      data-ui="room-tabs"
    >
      <div className="flex min-w-max">
        {links.map(({ href, label }) => {
          const active = pathname === href
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
