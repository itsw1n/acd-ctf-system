'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

type LogoutButtonProps = {
  action: (formData: FormData) => Promise<void>
  variant?: 'primary' | 'secondary' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}

/**
 * Logout trigger with a shared confirmation dialog. Owns only the trigger
 * and the logout submit form; the dialog chrome lives in ConfirmDialog.
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
      <ConfirmDialog
        title="Log out"
        eyebrow="// Session"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        description="End your current session? You will need to sign in again."
        confirm={
          <form action={action}>
            <Button type="submit" variant="warning" size="sm" className="w-full sm:w-auto">
              Log out
            </Button>
          </form>
        }
      />
    </>
  )
}
