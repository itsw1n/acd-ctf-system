'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Gauge, Shield, Trophy, UserRound } from 'lucide-react'
import { cn } from '@/lib/cn'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/profile', label: 'Profile', icon: UserRound },
]

const adminItems = [
  { href: '/admin', label: 'Admin' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/challenges', label: 'Challenges' },
  { href: '/admin/solves', label: 'Solves' },
]

function linkClass(active: boolean) {
  return cn(
    'relative flex h-14 items-center gap-4 border-b border-border/55 px-6 font-mono text-sm uppercase tracking-[0.08em] text-muted transition hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger',
    active &&
      'border-y-danger/70 bg-[linear-gradient(90deg,rgba(143,17,17,.75),rgba(143,17,17,.08))] text-foreground before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-danger before:shadow-[0_0_12px_rgba(227,38,54,.8)]'
  )
}

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden border-r border-border bg-background/92 lg:block" data-ui="sidebar">
        <nav
          aria-label="CTF navigation"
          className="sticky top-[85px] flex h-[calc(100vh-85px)] w-60 flex-col"
        >
          <div className="border-b border-border px-5 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {'// Navigation'}
          </div>
          <div className="py-2">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={linkClass(active)}
                >
                  <Icon size={20} strokeWidth={1.7} aria-hidden />
                  {label}
                </Link>
              )
            })}
          </div>
          {isAdmin && (
            <div className="py-2">
              <div className="flex items-center gap-2 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                <Shield size={13} aria-hidden className="text-danger" />
                {'// Admin'}
              </div>
              {adminItems.map(({ href, label }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={linkClass(active)}
                  >
                    <Shield size={18} strokeWidth={1.7} aria-hidden />
                    {label}
                  </Link>
                )
              })}
            </div>
          )}
          <div className="mt-auto border-t border-border p-5 font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-muted/70">
            Same students.
            <br />
            Different weaponry.
            <div className="mt-3 h-0.5 w-5 bg-danger" />
          </div>
        </nav>
      </aside>

      <nav
        aria-label="CTF mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        data-ui="mobile-navigation"
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger',
                active && 'bg-primary/20 text-danger-bright'
              )}
            >
              <Icon size={18} aria-hidden />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
