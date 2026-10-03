import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: member management lives under /rooms/[slug]/admin/members now.
export default async function AdminPlayersRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
