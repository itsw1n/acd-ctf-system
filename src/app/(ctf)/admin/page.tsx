import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: room management lives under /rooms/[slug]/admin now.
export default async function AdminRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
