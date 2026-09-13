export type Team = {
  id: string
  name: string
  slug: string
}

export type Player = {
  id: string
  fullName: string
  alias: string
  team: Team
}
