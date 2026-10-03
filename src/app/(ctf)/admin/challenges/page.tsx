import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: challenge management lives under /rooms/[slug]/admin/challenges now.
export default async function AdminChallengesRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
