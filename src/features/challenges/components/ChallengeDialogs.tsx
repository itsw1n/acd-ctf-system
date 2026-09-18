'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import type { ChallengeActionState } from '@/features/challenges/actions/challengeActions'
import type { ChallengeEditRow } from '@/features/challenges/types'
import { ChallengeForm } from '@/features/challenges/components/ChallengeForm'

type ChallengeAction = (
  previous: ChallengeActionState,
  formData: FormData
) => Promise<ChallengeActionState>

export function CreateChallengeDialog({ action }: { action: ChallengeAction }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button type="button" size="lg" className="w-full sm:w-auto" onPress={() => setIsOpen(true)}>
        <Plus size={18} aria-hidden />
        Create challenge
      </Button>
      <Modal title="Create challenge" eyebrow="// Admin" isOpen={isOpen} onOpenChange={setIsOpen}>
        <ChallengeForm mode="create" action={action} />
      </Modal>
    </>
  )
}

export function EditChallengeDialog({
  challenge,
  action,
}: {
  challenge: ChallengeEditRow
  action: ChallengeAction
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onPress={() => setIsOpen(true)}>
        Edit
      </Button>
      <Modal title={challenge.title} eyebrow="// Admin" isOpen={isOpen} onOpenChange={setIsOpen}>
        <ChallengeForm mode="edit" initial={challenge} action={action} />
      </Modal>
    </>
  )
}
