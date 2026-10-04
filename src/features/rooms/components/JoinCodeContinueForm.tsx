'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export function JoinCodeContinueForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <form
      action="/rooms/join"
      method="get"
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const code = String(formData.get('code') ?? '')
          .trim()
          .toUpperCase()
        if (!code) return
        setPending(true)
        router.push(`/rooms/join?code=${encodeURIComponent(code)}`)
      }}
    >
      <Input name="code" placeholder="RM-XXXXXX" autoComplete="off" spellCheck={false} />
      <Button
        type="submit"
        size="lg"
        isPending={pending}
        pendingLabel="Checking code"
        className="w-full sm:w-auto"
      >
        Continue
      </Button>
    </form>
  )
}
