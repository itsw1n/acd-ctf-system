'use client'

import type { ReactNode } from 'react'
import { Dialog, Modal as AriaModal, ModalOverlay } from 'react-aria-components'
import { X } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { cn } from '@/lib/cn'

export type ModalProps = {
  title: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  eyebrow?: string
  isDismissable?: boolean
  className?: string
}

/**
 * Shared modal dialog. Generic structure + behavior only — feature content
 * is passed as children. Appearance reuses the existing admin dialog chrome
 * (surface, danger border, glow, `// Admin` eyebrow, X close button).
 *
 * Behavior (focus trap, Escape, scroll lock, backdrop blocking) comes from
 * React Aria Components; this file only owns presentation.
 */
export function Modal({
  title,
  isOpen,
  onOpenChange,
  children,
  eyebrow = '// Admin',
  isDismissable = true,
  className,
}: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-[2px]"
    >
      <AriaModal
        className={cn(
          'w-full max-w-2xl border border-danger/60 bg-surface text-foreground shadow-[0_0_40px_rgba(227,38,54,.18)]',
          className
        )}
      >
        <Dialog
          aria-label={title}
          className="max-h-[min(90vh,760px)] overflow-y-auto p-5 outline-none sm:p-7"
        >
          {({ close }) => (
            <>
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  {eyebrow ? (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-danger">
                      {eyebrow}
                    </p>
                  ) : null}
                  <h2 className="mt-1 font-display text-2xl font-bold uppercase">{title}</h2>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label="Close dialog"
                  onPress={close}
                  className="min-h-9 px-3"
                >
                  <X size={16} aria-hidden />
                </Button>
              </div>
              {children}
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
