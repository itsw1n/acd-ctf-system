import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getSignupLock() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('competition_settings')
    .select('signups_locked')
    .eq('id', true)
    .single()
  if (error) throw new Error(`Unable to load competition settings: ${error.message}`)
  return data.signups_locked
}

export async function setSignupLock(locked: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('competition_settings')
    .update({ signups_locked: locked, updated_at: new Date().toISOString() })
    .eq('id', true)
  if (error) throw new Error(`Unable to update competition settings: ${error.message}`)
}
