'use server'

import { redirect } from 'next/navigation'
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
} from '@/features/auth/schemas/authSchemas'
import { signIn } from '@/features/auth/services/signIn'
import type { PlayerRole } from '@/features/players/types'
import { continueAfterSignup, signUp } from '@/features/auth/services/signUp'
import { resetPassword } from '@/features/auth/services/resetPassword'
import { clearCurrentSession } from '@/features/sessions/services/sessionService'
import { checkAuthRateLimit } from '@/lib/security/rateLimit'

export type SignUpState = {
  error?: string
  recoveryCode?: string
  alias?: string
  playerId?: string
}

export async function signUpAction(
  _previous: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    teamId: formData.get('teamId'),
    fullName: formData.get('fullName'),
    alias: formData.get('alias'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your registration details.' }
  }

  await checkAuthRateLimit(`signup:${parsed.data.alias.toLowerCase()}`)

  try {
    return await signUp(parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === 'ALIAS_TAKEN') {
      return { error: 'That alias is already taken. Choose another hacker tag.' }
    }
    if (error instanceof Error && error.message === 'TEAM_NOT_FOUND') {
      return { error: 'Selected team does not exist.' }
    }
    return { error: 'Registration failed. Please try again.' }
  }
}

export type ContinueSignupState = {
  error?: string
}

/**
 * Issues the first session after signup. The caller must prove knowledge of
 * the just-issued recovery code; a bare playerId grants nothing.
 */
export async function continueSignupAction(_previous: ContinueSignupState, formData: FormData) {
  const playerId = formData.get('playerId')
  const recoveryCode = formData.get('recoveryCode')

  if (
    typeof playerId !== 'string' ||
    typeof recoveryCode !== 'string' ||
    !playerId ||
    !recoveryCode
  ) {
    return { error: 'Verification failed. Please sign in.' }
  }

  await checkAuthRateLimit(`continue:${playerId}`)

  try {
    await continueAfterSignup({ playerId, recoveryCode })
  } catch {
    return { error: 'Verification failed. Please sign in.' }
  }

  redirect('/dashboard')
}

export type SignInState = {
  error?: string
}

export async function signInAction(
  _previous: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    alias: formData.get('alias'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Invalid alias or password.' }
  }

  await checkAuthRateLimit(`signin:${parsed.data.alias.toLowerCase()}`)

  let role: PlayerRole
  try {
    role = await signIn(parsed.data)
  } catch {
    // Generic failure for unknown alias AND wrong password alike.
    return { error: 'Invalid alias or password.' }
  }

  redirect(role === 'ADMIN' ? '/admin' : '/dashboard')
}

export type ResetPasswordState = {
  error?: string
}

export async function resetPasswordAction(
  _previous: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    alias: formData.get('alias'),
    recoveryCode: formData.get('recoveryCode'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' }
  }

  await checkAuthRateLimit(`reset:${parsed.data.alias.toLowerCase()}`)

  try {
    await resetPassword({
      alias: parsed.data.alias,
      recoveryCode: parsed.data.recoveryCode,
      newPassword: parsed.data.newPassword,
    })
  } catch {
    return { error: 'Alias or recovery code is incorrect.' }
  }

  redirect('/signin?reset=1')
}

export async function logoutAction() {
  await clearCurrentSession()
  redirect('/signin')
}
