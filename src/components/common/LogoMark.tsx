import Image from 'next/image'

import logo from '@/assets/logo.webp'
import { cn } from '@/lib/cn'

/**
 * Brand logo mark. Optimized WebP served via next/image; the 1MB source
 * PNG stays in src/assets untouched.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="ACD CTF logo"
      width={48}
      height={48}
      priority
      className={cn('h-10 w-10 object-cover sm:h-12 sm:w-12', className)}
    />
  )
}
