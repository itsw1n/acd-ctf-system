export type Team = {
  id: string
  name: string
  slug: string
}

export type PlayerRole = 'PLAYER' | 'ADMIN'

export type Player = {
  id: string
  fullName: string
  alias: string
  role: PlayerRole
  team: Team
}
