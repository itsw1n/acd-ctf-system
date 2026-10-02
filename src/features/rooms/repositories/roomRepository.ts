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

export async function banMembership(roomId: string, playerId: string) {
  const supabase = createAdminClient()
  const { error: deleteError } = await supabase
    .from('room_memberships')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId)

  if (deleteError) throw deleteError

  const { error: banError } = await supabase
    .from('room_bans')
    .insert({ room_id: roomId, player_id: playerId })
    .select('id')
    .single()

  if (banError && banError.code !== '23505') throw banError
}

export async function setMemberLockedRow(roomId: string, playerId: string, locked: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('room_memberships')
    .update({ access_locked: locked })
    .eq('room_id', roomId)
    .eq('player_id', playerId)

  if (error) throw error
}

export async function unbanMembership(roomId: string, playerId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('room_bans')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId)

  if (error) throw error
}

export async function updateRoomRow(
  roomId: string,
  patch: { name?: string; visibility?: 'PUBLIC' | 'PRIVATE'; joinLocked?: boolean }
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('rooms')
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.visibility !== undefined ? { visibility: patch.visibility } : {}),
      ...(patch.joinLocked !== undefined ? { join_locked: patch.joinLocked } : {}),
    })
    .eq('id', roomId)

  if (error) throw error
}

export async function listPublicRooms(): Promise<Room[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id,slug,name,visibility,join_locked')
    .eq('visibility', 'PUBLIC')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Unable to list rooms: ${error.message}`)
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    visibility: row.visibility,
    joinLocked: row.join_locked,
  }))
}

export async function listMyRooms(
  playerId: string
): Promise<Array<{ room: Room; role: 'OWNER' | 'PARTICIPANT'; teamId: string | null }>> {
  const supabase = createAdminClient()
  const { data: memberships, error } = await supabase
    .from('room_memberships')
    .select('room_id,role,team_id')
    .eq('player_id', playerId)

  if (error) throw new Error(`Unable to list rooms: ${error.message}`)
  if (!memberships?.length) return []

  const roomIds = [...new Set(memberships.map((membership) => membership.room_id))]
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id,slug,name,visibility,join_locked')
    .in('id', roomIds)

  if (roomsError) throw new Error(`Unable to list rooms: ${roomsError.message}`)

  const roomById = new Map((rooms ?? []).map((room) => [room.id, room]))
  return (memberships ?? []).flatMap((membership) => {
    const room = roomById.get(membership.room_id)
    if (!room) return []
    return [
      {
        room: {
          id: room.id,
          slug: room.slug,
          name: room.name,
          visibility: room.visibility,
          joinLocked: room.join_locked,
        },
        role: membership.role,
        teamId: membership.team_id,
      },
    ]
  })
}

export async function listBannedMembers(
  roomId: string
): Promise<Array<{ playerId: string; alias: string }>> {
  const supabase = createAdminClient()
  const { data: bans, error } = await supabase
    .from('room_bans')
    .select('player_id')
    .eq('room_id', roomId)

  if (error) throw new Error(`Unable to list bans: ${error.message}`)
  if (!bans?.length) return []

  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id,alias')
    .in(
      'id',
      bans.map((ban) => ban.player_id)
    )

  if (playersError) throw new Error('Unable to load banned players.')

  const aliasById = new Map((players ?? []).map((player) => [player.id, player.alias]))
  return (bans ?? []).map((ban) => ({
    playerId: ban.player_id,
    alias: aliasById.get(ban.player_id) ?? 'Unknown',
  }))
}

export type RoomMemberRow = {
  playerId: string
  alias: string
  fullName: string
  role: 'OWNER' | 'PARTICIPANT'
  teamId: string | null
  team: string
  accessLocked: boolean
}

export async function listRoomMembers(roomId: string): Promise<RoomMemberRow[]> {
  const supabase = createAdminClient()
  const { data: memberships, error } = await supabase
    .from('room_memberships')
    .select('player_id,role,team_id,access_locked')
    .eq('room_id', roomId)

  if (error) throw new Error(`Unable to list members: ${error.message}`)
  if (!memberships?.length) return []

  const memberIds = [...new Set(memberships.map((membership) => membership.player_id))]
  const [{ data: players, error: playersError }, { data: teams, error: teamsError }] =
    await Promise.all([
      supabase.from('players').select('id,alias,full_name').in('id', memberIds),
      supabase.from('teams').select('id,name').eq('room_id', roomId),
    ])

  if (playersError || teamsError) throw new Error('Unable to load member details.')

  const playerById = new Map((players ?? []).map((player) => [player.id, player]))
  const teamById = new Map((teams ?? []).map((team) => [team.id, team.name]))
  const membershipByPlayerId = new Map(
    (memberships ?? []).map((membership) => [membership.player_id, membership])
  )

  return memberIds.flatMap((playerId) => {
    const player = playerById.get(playerId)
    const membership = membershipByPlayerId.get(playerId)
    if (!player || !membership) return []
    return [
      {
        playerId,
        alias: player.alias,
        fullName: player.full_name,
        role: membership.role,
        teamId: membership.team_id,
        team: membership.team_id ? (teamById.get(membership.team_id) ?? 'Unknown') : '—',
        accessLocked: membership.access_locked,
      },
    ]
  })
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
