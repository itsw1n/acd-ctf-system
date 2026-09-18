'use client'

import { useState } from 'react'

import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import type { TeamActionState } from '@/features/teams/actions/teamActions'
import { RenameTeamForm } from '@/features/teams/components/TeamForms'

export function RenameTeamDialog({
  teamId,
  teamName,
  action,
}: {
  teamId: string
  teamName: string
  action: (previous: TeamActionState, formData: FormData) => Promise<TeamActionState>
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onPress={() => setIsOpen(true)}>
        Edit
      </Button>
      <Modal title={`Edit ${teamName}`} isOpen={isOpen} onOpenChange={setIsOpen}>
        <RenameTeamForm teamId={teamId} defaultName={teamName} action={action} />
      </Modal>
    </>
  )
}
