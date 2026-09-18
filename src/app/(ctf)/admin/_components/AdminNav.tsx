'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/challenges', label: 'Challenges' },
  { href: '/admin/solves', label: 'Solves' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Admin navigation"
      className="overflow-x-auto border border-border bg-background/75"
      data-ui="admin-nav"
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
