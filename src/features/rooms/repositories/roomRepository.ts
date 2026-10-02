import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Room, RoomMembership } from '@/features/rooms/types'

export const DEFAULT_ROOM_SLUG = 'acd-ctf'

export async function getDefaultRoom(): Promise<Room> {
  const room = await getRoomBySlug(DEFAULT_ROOM_SLUG)
  if (!room) throw new Error('DEFAULT_ROOM_MISSING')
  return room
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id,slug,name,visibility,join_locked')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    visibility: data.visibility,
    joinLocked: data.join_locked,
  }
}

export function slugifyRoomName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createRoomRow(input: {
  name: string
  slug: string
  visibility: 'PUBLIC' | 'PRIVATE'
  joinCode: string
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name: input.name,
      slug: input.slug,
      visibility: input.visibility,
      join_code: input.joinCode,
    })
    .select('id,slug,name,visibility,join_locked')
    .single()

  if (error) throw error
  return {
    id: data.id as string,
    slug: data.slug as string,
    name: data.name as string,
    visibility: data.visibility as Room['visibility'],
    joinLocked: data.join_locked as boolean,
  }
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id,slug,name,visibility,join_locked')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    visibility: data.visibility,
    joinLocked: data.join_locked,
  }
}

export async function getRoomByJoinCode(code: string): Promise<Room | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id,slug,name,visibility,join_locked')
    .eq('join_code', code.toUpperCase())
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    visibility: data.visibility,
    joinLocked: data.join_locked,
  }
}

export async function createMembership(input: {
  roomId: string
  playerId: string
  role: 'OWNER' | 'PARTICIPANT'
  teamId: string | null
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('room_memberships')
    .insert({
      room_id: input.roomId,
      player_id: input.playerId,
      role: input.role,
      team_id: input.teamId,
    })
    .select('room_id,player_id,role,team_id,access_locked')
    .single()

  if (error) throw error
  return {
    roomId: data.room_id as string,
    playerId: data.player_id as string,
    role: data.role as 'OWNER' | 'PARTICIPANT',
    teamId: (data.team_id ?? null) as string | null,
    accessLocked: data.access_locked as boolean,
  }
}

export async function deleteMembership(roomId: string, playerId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('room_memberships')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId)

  if (error) throw error
}

export async function isBanned(roomId: string, playerId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('room_bans')
    .select('id')
    .eq('room_id', roomId)
    .eq('player_id', playerId)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

export async function getRoomTeam(teamId: string, roomId: string): Promise<{ id: string } | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .eq('room_id', roomId)
    .maybeSingle()

  if (error || !data) return null
  return { id: data.id }
}

export async function setJoinLockedRow(roomId: string, locked: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('rooms').update({ join_locked: locked }).eq('id', roomId)

  if (error) throw error
}

export async function updateJoinCodeRow(roomId: string, code: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('rooms').update({ join_code: code }).eq('id', roomId)

  if (error) throw error
}

export async function getMembership(
  roomId: string,
  playerId: string
): Promise<RoomMembership | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('room_memberships')
    .select('room_id,player_id,role,team_id,access_locked')
    .eq('room_id', roomId)
    .eq('player_id', playerId)
    .maybeSingle()

  if (error || !data) return null
  return {
    roomId: data.room_id,
    playerId: data.player_id,
    role: data.role,
    teamId: data.team_id,
    accessLocked: data.access_locked,
  }
}
