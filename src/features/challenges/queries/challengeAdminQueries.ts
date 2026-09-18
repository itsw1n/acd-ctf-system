import 'server-only'

import { requireAdmin } from '@/features/admin/services/requireAdmin'
import {
  getChallengeForEdit,
  listChallengesAdmin,
} from '@/features/challenges/repositories/challengeRepository'

/** Server-side reads shaped for admin UI. No flag hashes leave this boundary. */
export async function listChallengesForAdmin() {
  await requireAdmin()
  return listChallengesAdmin()
}

export async function getChallengeForAdminEdit(challengeId: string) {
  await requireAdmin()
  return getChallengeForEdit(challengeId)
}
