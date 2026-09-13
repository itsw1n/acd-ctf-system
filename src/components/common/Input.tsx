'use client'

import type { ComponentProps } from 'react'
import { Input as AriaInput } from 'react-aria-components'
import { cn } from '@/lib/cn'

type InputProps = ComponentProps<typeof AriaInput>

export function Input({ className, ...props }: InputProps) {
  return (
    <AriaInput
      className={cn(
        'clip-input h-12 w-full border border-border-strong bg-background/90 px-4 font-mono text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-danger focus:shadow-[inset_0_0_18px_rgba(227,38,54,.05),0_0_10px_rgba(227,38,54,.08)]',
        className
      )}
      {...props}
    />
  )
}
