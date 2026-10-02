'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/features/auth/services/requireAdmin'
import { setSignupLock } from '@/features/competition/repositories/competitionRepository'

export async function setSignupLockAction(formData: FormData) {
  await requireAdmin()
  const value = formData.get('locked')
  if (value !== 'true' && value !== 'false') return
  await setSignupLock(value === 'true')
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
}
