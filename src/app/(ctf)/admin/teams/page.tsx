import { redirect } from 'next/navigation'

import { requireCurrentPlayer } from '@/features/sessions/services/sessionService'

// Legacy route: team management lives under /rooms/[slug]/admin/teams now.
export default async function AdminTeamsRedirect() {
  await requireCurrentPlayer()
  redirect('/rooms')
}
