import { redirect } from 'next/navigation'
import { getCurrentPlayer } from '@/features/sessions/services/sessionService'

export default async function RootPage() {
  const currentPlayer = await getCurrentPlayer()
  redirect(currentPlayer ? '/dashboard' : '/signin')
}
