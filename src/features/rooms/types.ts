export type RoomVisibility = 'PUBLIC' | 'PRIVATE'

export type RoomMembershipRole = 'OWNER' | 'PARTICIPANT'

export type Room = {
  id: string
  slug: string
  name: string
  visibility: RoomVisibility
  joinLocked: boolean
}

export type RoomMembership = {
  roomId: string
  playerId: string
  role: RoomMembershipRole
  teamId: string | null
  accessLocked: boolean
}
