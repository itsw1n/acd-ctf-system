'use client'

import type { ComponentProps } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'clip-button relative inline-flex min-h-11 items-center justify-center gap-2 border px-6 font-display text-sm font-semibold uppercase tracking-[0.14em] outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-danger/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'border-danger-bright/70 bg-[linear-gradient(180deg,#e32636_0%,#b51622_45%,#8f1111_100%)] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_3px_0_rgba(60,4,8,0.9),0_0_16px_rgba(227,38,54,0.18)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_0_rgba(60,4,8,0.9),0_0_24px_rgba(227,38,54,0.35)] hover:brightness-110 active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_0_rgba(60,4,8,0.9)]',
        secondary:
          'border-border-strong bg-surface text-foreground hover:border-danger hover:text-white',
        warning: 'border-warning bg-warning/10 text-warning hover:bg-warning/15',
      },
      size: {
        sm: 'min-h-9 px-4 text-xs',
        md: 'min-h-11 px-6 text-sm',
        lg: 'min-h-14 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

type AriaButtonProps = Omit<ComponentProps<typeof AriaButton>, 'className'>

type ButtonProps = AriaButtonProps &
  VariantProps<typeof buttonVariants> & {
    className?: string
  }

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <AriaButton className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
