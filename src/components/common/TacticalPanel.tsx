import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TacticalPanelProps = HTMLAttributes<HTMLDivElement> & {
  label?: string
  index?: string
  children: ReactNode
}

export function TacticalPanel({ label, index, children, className, ...props }: TacticalPanelProps) {
  return (
    <div className="relative pt-3">
      {(label || index) && (
        <div className="absolute left-6 top-0 z-20 flex items-center gap-3 bg-background px-3 font-mono text-xs uppercase tracking-[0.16em] text-muted">
          <span className="text-danger" aria-hidden>
            {'//'}
          </span>
          {label && <span>{label}</span>}
          {index && <span className="text-muted/60">{index}</span>}
        </div>
      )}
      <div
        className={cn(
          'clip-panel relative border border-border bg-surface/88 shadow-[inset_0_0_36px_rgba(143,17,17,0.035)]',
          className
        )}
        {...props}
      >
        <span aria-hidden className="corner-bracket corner-bracket-tl" />
        <span aria-hidden className="corner-bracket corner-bracket-br" />
        {children}
      </div>
    </div>
  )
}
