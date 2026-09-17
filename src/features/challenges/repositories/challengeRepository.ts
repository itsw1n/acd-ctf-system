import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ChallengeType } from '@/features/challenges/schemas/challengeSchemas'
import type { ChallengeEditRow } from '@/features/challenges/types'

export type AdminChallengeRow = {
  id: string
  title: string
  category: string
  type: ChallengeType
  points: number
  active: boolean
  createdAt: string
}

export type { ChallengeEditRow } from '@/features/challenges/types'

export type InsertChallengeRow = {
  title: string
  category: string
  description: string
  type: ChallengeType
  points: number
  flagHash: string
  flag: string
  externalUrl?: string
  fileUrl?: string
  active: boolean
}

export async function listChallengesAdmin(): Promise<AdminChallengeRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,category,type,points,active,created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Unable to load challenges: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.type as ChallengeType,
    points: row.points,
    active: row.active,
    createdAt: row.created_at,
  }))
}

export async function getChallengeForEdit(challengeId: string): Promise<ChallengeEditRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,category,description,type,points,flag,external_url,file_url,active')
    .eq('id', challengeId)
    .maybeSingle()

  if (error) throw new Error(`Unable to load challenge: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    description: data.description,
    type: data.type as ChallengeType,
    points: data.points,
    flag: data.flag,
    externalUrl: data.external_url,
    fileUrl: data.file_url,
    active: data.active,
  }
}

export async function getChallengeFlagHash(challengeId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('flag_hash')
    .eq('id', challengeId)
    .maybeSingle()

  if (error) throw new Error(`Unable to load challenge: ${error.message}`)
  return data?.flag_hash ?? null
}

export async function insertChallenge(input: InsertChallengeRow) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      title: input.title,
      category: input.category,
      description: input.description,
      type: input.type,
      points: input.points,
      flag_hash: input.flagHash,
      flag: input.flag,
      external_url: input.externalUrl ?? null,
      file_url: input.fileUrl ?? null,
      active: input.active,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('FLAG_IN_USE')
    throw new Error(`Unable to create challenge: ${error.message}`)
  }

  return data.id as string
}

export async function updateChallengeRow(
  challengeId: string,
  input: {
    title: string
    category: string
    description: string
    type: ChallengeType
    points: number
    flag?: string
    externalUrl?: string
    fileUrl?: string
    active: boolean
    flagHash?: string
  }
) {
  const supabase = createAdminClient()
  const patch: Record<string, unknown> = {
    title: input.title,
    category: input.category,
    description: input.description,
    type: input.type,
    points: input.points,
    external_url: input.externalUrl ?? null,
    file_url: input.fileUrl ?? null,
    active: input.active,
    updated_at: new Date().toISOString(),
  }
  if (input.flagHash) patch.flag_hash = input.flagHash
  if (input.flag) patch.flag = input.flag

  const { error } = await supabase.from('challenges').update(patch).eq('id', challengeId)

  if (error) {
    if (error.code === '23505') throw new Error('FLAG_IN_USE')
    throw new Error(`Unable to update challenge: ${error.message}`)
  }
}

export async function setChallengeActive(challengeId: string, active: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('challenges')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', challengeId)

  if (error) throw new Error(`Unable to update challenge: ${error.message}`)
}
