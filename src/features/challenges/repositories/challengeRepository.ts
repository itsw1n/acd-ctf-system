import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { decryptFlag } from '@/lib/security/flagCrypto'
import type {
  ChallengeDifficulty,
  ChallengeType,
} from '@/features/challenges/schemas/challengeSchemas'
import type { ChallengeEditRow } from '@/features/challenges/types'

export type AdminChallengeRow = {
  id: string
  title: string
  author: string
  category: string
  type: ChallengeType
  difficulty: ChallengeDifficulty
  points: number
  active: boolean
  createdAt: string
}

export type { ChallengeEditRow } from '@/features/challenges/types'

export type InsertChallengeRow = {
  roomId: string
  title: string
  category: string
  description: string
  difficulty: ChallengeDifficulty
  hint: string | null
  type: ChallengeType
  points: number
  flagHash: string
  flagEncrypted: string
  author: string
  externalUrl?: string
  active: boolean
}

export async function listChallengesAdmin(roomId: string): Promise<AdminChallengeRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,author,category,type,difficulty,points,active,created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Unable to load challenges: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    type: row.type as ChallengeType,
    difficulty: row.difficulty as ChallengeDifficulty,
    points: row.points,
    active: row.active,
    createdAt: row.created_at,
  }))
}

export async function getChallengeForEdit(
  challengeId: string,
  roomId: string
): Promise<ChallengeEditRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select(
      'id,title,author,category,description,type,difficulty,hint,points,flag_encrypted,external_url,active'
    )
    .eq('id', challengeId)
    .eq('room_id', roomId)
    .maybeSingle()

  if (error) throw new Error(`Unable to load challenge: ${error.message}`)
  if (!data) return null

  let flag: string | null = null
  if (data.flag_encrypted) {
    try {
      flag = decryptFlag(data.flag_encrypted as string)
    } catch {
      throw new Error('Unable to load challenge: stored flag cannot be decrypted')
    }
  }

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    category: data.category,
    description: data.description,
    type: data.type as ChallengeType,
    difficulty: data.difficulty as ChallengeDifficulty,
    hint: data.hint,
    points: data.points,
    flag,
    externalUrl: data.external_url,
    active: data.active,
  }
}

export async function getChallengeFlagHash(
  challengeId: string,
  roomId: string
): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('flag_hash')
    .eq('id', challengeId)
    .eq('room_id', roomId)
    .maybeSingle()

  if (error) throw new Error(`Unable to load challenge: ${error.message}`)
  return data?.flag_hash ?? null
}

export async function insertChallenge(input: InsertChallengeRow) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      room_id: input.roomId,
      title: input.title,
      author: input.author,
      category: input.category,
      description: input.description,
      type: input.type,
      difficulty: input.difficulty,
      hint: input.hint ?? null,
      points: input.points,
      flag_hash: input.flagHash,
      flag_encrypted: input.flagEncrypted,
      external_url: input.externalUrl ?? null,
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
  roomId: string,
  input: {
    title: string
    author: string
    category: string
    description: string
    type: ChallengeType
    difficulty: ChallengeDifficulty
    hint?: string
    points: number
    flagEncrypted?: string
    externalUrl?: string
    active: boolean
    flagHash?: string
  }
) {
  const supabase = createAdminClient()
  const patch: Record<string, unknown> = {
    title: input.title,
    author: input.author,
    category: input.category,
    description: input.description,
    type: input.type,
    difficulty: input.difficulty,
    hint: input.hint ?? null,
    points: input.points,
    external_url: input.externalUrl ?? null,
    active: input.active,
    updated_at: new Date().toISOString(),
  }
  if (input.flagHash) patch.flag_hash = input.flagHash
  if (input.flagEncrypted) patch.flag_encrypted = input.flagEncrypted

  const { error } = await supabase
    .from('challenges')
    .update(patch)
    .eq('id', challengeId)
    .eq('room_id', roomId)

  if (error) {
    if (error.code === '23505') throw new Error('FLAG_IN_USE')
    throw new Error(`Unable to update challenge: ${error.message}`)
  }
}

export async function setChallengeActive(
  challengeId: string,
  roomId: string,
  active: boolean
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('challenges')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', challengeId)
    .eq('room_id', roomId)

  if (error) throw new Error(`Unable to update challenge: ${error.message}`)
}
