import { expect, test, type Page } from '@playwright/test'

const PASSWORD = 'e2e-test-password'

function uniqueAlias(prefix: string) {
  return `${prefix}${Date.now().toString(36)}`.slice(0, 24)
}

async function selectFirstTeam(page: Page) {
  // Team picker is the shared RAC Select (button trigger + listbox popover),
  // so drive it the way a user does instead of using a native select driver.
  await page.getByRole('button', { name: /select a team/i }).click()
  await page.getByRole('listbox').getByRole('option').first().click()
}

async function signUp(page: Page, alias: string, password: string = PASSWORD) {
  await page.goto('/signup')
  await selectFirstTeam(page)
  await page.getByPlaceholder('Enter your full name').fill('E2E Player')
  await page.getByPlaceholder('Choose your hacker tag').fill(alias)
  await page.getByPlaceholder('Minimum 10 characters').fill(password)
  await page.getByPlaceholder('Repeat your password').fill(password)
  await page.getByRole('button', { name: /create account/i }).click()
}

test('root and dashboard redirect logged-out visitors to signin', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/signin')
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/signin')
  await expect(page.getByRole('heading', { name: 'Enter the CTF' })).toBeVisible()
})

test('signup shows the recovery code once, then continues to the dashboard', async ({ page }) => {
  const alias = uniqueAlias('e2ecode')
  await signUp(page, alias)

  const code = page.getByText(/ACD-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/)
  await expect(code).toBeVisible()

  await page.getByRole('button', { name: /i saved my code/i }).click()
  await expect(page).toHaveURL('/dashboard')

  await page.goto('/profile')
  await expect(page.getByText('PLAYER').first()).toBeVisible()
})

test('duplicate alias is rejected', async ({ page }) => {
  const alias = uniqueAlias('e2edup')
  await signUp(page, alias)
  await expect(page.getByText(/ACD-[A-Z2-9]{4}/)).toBeVisible()

  await page.goto('/signup')
  await selectFirstTeam(page)
  await page.getByPlaceholder('Enter your full name').fill('E2E Clone')
  await page.getByPlaceholder('Choose your hacker tag').fill(alias)
  await page.getByPlaceholder('Minimum 10 characters').fill(PASSWORD)
  await page.getByPlaceholder('Repeat your password').fill(PASSWORD)
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.getByText(/already taken/i)).toBeVisible()
})

test('signin rejects wrong passwords with a generic error', async ({ page }) => {
  const alias = uniqueAlias('e2elogin')
  await signUp(page, alias)
  await expect(page.getByText(/ACD-[A-Z2-9]{4}/)).toBeVisible()
  await page.getByRole('button', { name: /i saved my code/i }).click()
  await expect(page).toHaveURL('/dashboard')

  await page.goto('/profile')
  await page.getByRole('button', { name: /end session/i }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^log out$/i })
    .click()
  await expect(page).toHaveURL('/signin')

  await page.goto('/signin')
  await page.getByPlaceholder('Enter your alias').fill(alias)
  await page.getByPlaceholder('Enter your password').fill('wrongpassword1')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  // Pending indicator proves the submit was picked up; without it the error
  // assertion below could match the previous attempt's stale text.
  await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible()
  await expect(page.getByText('Invalid alias or password.')).toBeVisible()
  // Settle: wait for the round-trip to finish before the next submit so
  // later assertions and clicks can never match a stale in-flight state.
  await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()

  await page.getByPlaceholder('Enter your alias').fill('nosuchaliasZZZ')
  await page.getByPlaceholder('Enter your password').fill('wrongpassword1')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible()
  await expect(page.getByText('Invalid alias or password.')).toBeVisible()
  await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()

  await page.getByPlaceholder('Enter your alias').fill(alias)
  await page.getByPlaceholder('Enter your password').fill(PASSWORD)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL('/dashboard')
})

test('forgot-password resets the password and revokes old sessions', async ({ page, context }) => {
  const alias = uniqueAlias('e2ereset')
  await signUp(page, alias)
  const code = await page.getByText(/ACD-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/).textContent()

  await page.getByRole('button', { name: /i saved my code/i }).click()
  await expect(page).toHaveURL('/dashboard')

  const oldCookies = await context.cookies()
  const oldSession = oldCookies.find((c) => c.name === 'acd_ctf_session')?.value
  expect(oldSession).toBeTruthy()

  await page.goto('/profile')
  await page.getByRole('button', { name: /end session/i }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^log out$/i })
    .click()
  await expect(page).toHaveURL('/signin')

  await page.goto('/forgot-password')
  await page.getByPlaceholder('Enter your alias').fill(alias)
  await page.getByPlaceholder('ACD-XXXX-XXXX-XXXX').fill(code ?? '')
  await page.getByRole('button', { name: /verify/i }).click()
  await page.getByPlaceholder('Minimum 10 characters').fill('brand-new-password')
  await page.getByPlaceholder('Repeat your password').fill('brand-new-password')
  await page.getByRole('button', { name: /reset password/i }).click()
  await expect(page).toHaveURL('/signin?reset=1')
  await expect(page.getByText(/password reset/i)).toBeVisible()

  // Old session cookie must no longer grant access.
  const fresh = await context.browser()?.newContext({ baseURL: 'http://localhost:3000' })
  await fresh?.addCookies([
    {
      name: 'acd_ctf_session',
      value: oldSession ?? '',
      domain: 'localhost',
      path: '/',
    },
  ])
  const stranger = await fresh?.newPage()
  await stranger?.goto('/dashboard')
  await expect(stranger?.url()).toBe('http://localhost:3000/signin')
  await fresh?.close()

  // New password works.
  await page.getByPlaceholder('Enter your alias').fill(alias)
  await page.getByPlaceholder('Enter your password').fill('brand-new-password')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL('/dashboard')
})
