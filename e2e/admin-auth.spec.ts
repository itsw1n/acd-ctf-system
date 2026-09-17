import { expect, test, type Page } from '@playwright/test'

// Seeded demo credentials (supabase/seed.sql, local dev only).
const PLAYER = { alias: 'rapz', password: 'ctf-demo-1234' }
const ADMIN = { alias: 'root', password: 'ctf-demo-1234' }

async function signIn(page: Page, alias: string, password: string) {
  await page.goto('/signin')
  await page.getByPlaceholder('Enter your alias').fill(alias)
  await page.getByPlaceholder('Enter your password').fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
}

test('guest visiting /admin is sent to signin', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL('/signin')
})

test('admin login lands on /admin', async ({ page }) => {
  await signIn(page, ADMIN.alias, ADMIN.password)
  await expect(page).toHaveURL('/admin')
})

test('player visiting /admin is sent to /dashboard', async ({ page }) => {
  await signIn(page, PLAYER.alias, PLAYER.password)
  await expect(page).toHaveURL('/dashboard')

  await page.goto('/admin')
  await expect(page).toHaveURL('/dashboard')
})

test('admin visiting player routes is sent to /admin', async ({ page }) => {
  await signIn(page, ADMIN.alias, ADMIN.password)
  await expect(page).toHaveURL('/admin')

  await page.goto('/dashboard')
  await expect(page).toHaveURL('/admin')
})
