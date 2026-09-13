import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section data-ui="section" className={cn('py-6 lg:py-8', className)} {...props} />
}
