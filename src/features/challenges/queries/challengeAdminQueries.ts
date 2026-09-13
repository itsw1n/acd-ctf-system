import 'server-only'

import {
  getChallengeForEdit,
  listChallengesAdmin,
} from '@/features/challenges/repositories/challengeRepository'

/** Server-side reads shaped for admin UI. No flag hashes leave this boundary. */
export async function listChallengesForAdmin() {
  return listChallengesAdmin()
}

export async function getChallengeForAdminEdit(challengeId: string) {
  return getChallengeForEdit(challengeId)
}
