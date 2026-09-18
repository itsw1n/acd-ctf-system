'use client'

import type { ReactNode } from 'react'
import { Dialog, Heading, Modal as AriaModal, ModalOverlay } from 'react-aria-components'
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
 * is passed as children. Appearance reuses the existing dialog chrome
 * (surface, danger border, glow, eyebrow line, X close button).
 *
 * Behavior (focus trap, Escape, scroll lock, backdrop blocking) comes from
 * React Aria Components; this file only owns presentation.
 */
export function Modal({
  title,
  isOpen,
  onOpenChange,
  children,
  eyebrow,
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
        <Dialog className="flex max-h-[min(90vh,760px)] flex-col overflow-hidden p-5 outline-none sm:p-7">
          {({ close }) => (
            <>
              <div className="mb-5 flex shrink-0 items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  {eyebrow ? (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-danger">
                      {eyebrow}
                    </p>
                  ) : null}
                  <Heading
                    slot="title"
                    level={2}
                    className="mt-1 font-display text-2xl font-bold uppercase"
                  >
                    {title}
                  </Heading>
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
              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
