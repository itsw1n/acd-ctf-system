import 'server-only'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import {
  getChallengeForEdit,
  listChallengesAdmin,
} from '@/features/challenges/repositories/challengeRepository'

/** Server-side reads shaped for admin UI. No flag hashes leave this boundary. */
export async function listChallengesForAdmin(roomId: string) {
  await requireRoomOwnerById(roomId)
  return listChallengesAdmin(roomId)
}

export async function getChallengeForAdminEdit(challengeId: string, roomId: string) {
  await requireRoomOwnerById(roomId)
  return getChallengeForEdit(challengeId, roomId)
}
