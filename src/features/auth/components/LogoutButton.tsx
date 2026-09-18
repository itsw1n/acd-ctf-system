'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'

type LogoutButtonProps = {
  action: (formData: FormData) => Promise<void>
  variant?: 'primary' | 'secondary' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}

/**
 * Logout trigger with a React Aria confirmation dialog. The destructive
 * server action only runs after explicit confirmation inside the modal.
 */
export function LogoutButton({ action, variant, size, className, children }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onPress={() => setIsOpen(true)}
      >
        {children}
      </Button>
      <Modal title="Log out" eyebrow="// Session" isOpen={isOpen} onOpenChange={setIsOpen}>
        <p className="font-mono text-sm leading-6 text-muted">
          End your current session? You will need to sign in again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="sm" onPress={() => setIsOpen(false)}>
            Cancel
          </Button>
          <form action={action}>
            <Button type="submit" variant="warning" size="sm" className="w-full sm:w-auto">
              Log out
            </Button>
          </form>
        </div>
      </Modal>
    </>
  )
}
