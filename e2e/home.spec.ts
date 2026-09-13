import { expect, test } from '@playwright/test'

test('access page shows the join form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Enter the CTF' })).toBeVisible()
  await expect(page.getByText('Join CTF')).toBeVisible()
  await expect(page.getByText('Full name')).toBeVisible()
  await expect(page.getByPlaceholder('Choose your hacker tag')).toBeVisible()
})

test('dashboard redirects unauthenticated players to access', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Enter the CTF' })).toBeVisible()
})
