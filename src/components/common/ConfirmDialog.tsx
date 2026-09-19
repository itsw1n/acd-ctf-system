'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'

export type ConfirmDialogProps = {
  title: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  description: ReactNode
  confirm: ReactNode
  cancelLabel?: string
  eyebrow?: string
}

/**
 * Shared confirmation dialog. Owns the dialog chrome (title, message,
 * cancel + confirm footer) — the confirm side is a slot so features can
 * pass their own behavior, e.g. a server-action submit form.
 */
export function ConfirmDialog({
  title,
  isOpen,
  onOpenChange,
  description,
  confirm,
  cancelLabel = 'Cancel',
  eyebrow,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} eyebrow={eyebrow} isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="font-mono text-sm leading-6 text-muted">{description}</div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" size="sm" onPress={() => onOpenChange(false)}>
          {cancelLabel}
        </Button>
        {confirm}
      </div>
    </Modal>
  )
}
