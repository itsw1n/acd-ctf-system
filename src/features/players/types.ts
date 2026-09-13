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
  // ADMIN accounts have no competition team (see 004_teamless_admin.sql).
  team: Team | null
}
