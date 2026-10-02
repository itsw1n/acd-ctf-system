/**
 * Account identity. Teams, roles, and locks live on the per-room
 * membership (see room_memberships), never on the account row.
 */
export type Player = {
  id: string
  fullName: string
  alias: string
}
