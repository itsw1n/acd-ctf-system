import type { Team } from '@/features/teams/types'

export type PlayerRole = 'PLAYER' | 'ADMIN'

export type Player = {
  id: string
  fullName: string
  alias: string
  role: PlayerRole
  accessLocked?: boolean
  // ADMIN accounts have no competition team (see 004_teamless_admin.sql).
  team: Team | null
}
