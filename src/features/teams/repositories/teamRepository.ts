import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export type AdminTeamRow = {
  id: string
  name: string
  slug: string
  createdAt: string
}

export function slugifyTeamName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'team'
}

export async function listTeamsAdmin(roomId: string): Promise<AdminTeamRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('teams')
    .select('id,name,slug,created_at')
    .eq('room_id', roomId)
    .order('name')

  if (error) throw new Error(`Unable to load teams: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  }))
}

export async function createTeamRow(input: { roomId: string; name: string; slug: string }) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('teams')
    .insert({ room_id: input.roomId, name: input.name, slug: input.slug })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('TEAM_TAKEN')
    throw new Error(`Unable to create team: ${error.message}`)
  }

  return data.id as string
}

export async function renameTeamRow(
  teamId: string,
  roomId: string,
  input: { name: string; slug: string }
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('teams')
    .update({ name: input.name, slug: input.slug })
    .eq('id', teamId)
    .eq('room_id', roomId)

  if (error) {
    if (error.code === '23505') throw new Error('TEAM_TAKEN')
    throw new Error(`Unable to rename team: ${error.message}`)
  }
}
