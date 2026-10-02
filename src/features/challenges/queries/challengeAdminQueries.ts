import 'server-only'

import { requireRoomOwnerById } from '@/features/rooms/services/requireRoom'
import { getDefaultRoom } from '@/features/rooms/repositories/roomRepository'
import {
  getChallengeForEdit,
  listChallengesAdmin,
} from '@/features/challenges/repositories/challengeRepository'

/** Server-side reads shaped for admin UI. No flag hashes leave this boundary. */
export async function listChallengesForAdmin() {
  const room = await getDefaultRoom()
  await requireRoomOwnerById(room.id)
  return listChallengesAdmin(room.id)
}

export async function getChallengeForAdminEdit(challengeId: string) {
  const room = await getDefaultRoom()
  await requireRoomOwnerById(room.id)
  return getChallengeForEdit(challengeId, room.id)
}
