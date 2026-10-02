import { expect, test, type Browser, type Page } from '@playwright/test'

const PASSWORD = 'e2e-test-password'

function uniqueAlias(prefix: string) {
  return `${prefix}${Date.now().toString(36)}`.slice(0, 20)
}

async function signUp(page: Page, alias: string) {
  await page.goto('/signup')
  await page.getByPlaceholder('Enter your full name').fill('E2E Player')
  await page.getByPlaceholder('Choose your hacker tag').fill(alias)
  await page.getByPlaceholder('Minimum 10 characters').fill(PASSWORD)
  await page.getByPlaceholder('Repeat your password').fill(PASSWORD)
  await page.getByRole('button', { name: /create account/i }).click()
  await page.getByText(/ACD-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/).waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: /i saved my code/i }).click()
  await expect(page).toHaveURL('/rooms')
}

async function signIn(page: Page, alias: string, password: string) {
  await page.goto('/signin')
  await page.getByPlaceholder('Enter your alias').fill(alias)
  await page.getByPlaceholder('Enter your password').fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
}

async function createRoom(page: Page, name: string): Promise<string> {
  await page.goto('/rooms/new')
  await page.getByPlaceholder('Friday Night CTF').fill(name)
  await page.getByRole('button', { name: /create room/i }).click()
  await page.waitForURL(
    (url) => !/\/(new|join|browse)(\?|$)/.test(url.pathname.replace('/rooms', '')),
    { timeout: 15000 }
  )
  return page.url().split('/rooms/')[1]
}

async function readJoinCode(page: Page, slug: string): Promise<string> {
  await page.goto(`/rooms/${slug}/admin`)
  const code = await page
    .getByText(/RM-[A-Z2-9]{6}/)
    .first()
    .textContent({ timeout: 10000 })
  return code!.trim()
}

async function createTeam(page: Page, slug: string, name: string) {
  await page.goto(`/rooms/${slug}/admin/teams`)
  await page.getByPlaceholder('New team name').fill(name)
  await page.getByRole('button', { name: /create team/i }).click()
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 15000 })
}

async function joinRoom(page: Page, code: string, teamName: string) {
  await page.goto(`/rooms/join?code=${code}`)
  await page.getByRole('button', { name: /select a team/i }).click()
  await page.getByRole('listbox').getByRole('option', { name: teamName }).click()
  await page.getByRole('button', { name: /^join room/i }).click()
}

test('guest visiting /rooms is sent to signin', async ({ page }) => {
  await page.goto('/rooms')
  await expect(page).toHaveURL('/signin')
})

test('host creates a room, manages it, and cannot play it', async ({ page }) => {
  const alias = uniqueAlias('e2ehost')
  await signUp(page, alias)

  const slug = await createRoom(page, `Host Room ${alias}`)
  const code = await readJoinCode(page, slug)
  expect(code).toMatch(/RM-[A-Z2-9]{6}/)

  await createTeam(page, slug, 'Red Team')

  // Owners manage but cannot compete in their own room.
  await page.goto(`/rooms/${slug}/play`)
  await expect(page).toHaveURL(new RegExp(`/rooms/${slug}/admin`))
})

test('participant joins by code and appears in members', async ({ page, browser }) => {
  const hostAlias = uniqueAlias('e2eowner')
  await signUp(page, hostAlias)
  const slug = await createRoom(page, `Join Room ${hostAlias}`)
  const code = await readJoinCode(page, slug)
  await createTeam(page, slug, 'Blue Team')

  const guest = await browser.newPage()
  try {
    const guestAlias = uniqueAlias('e2eguest')
    await signUp(guest, guestAlias)
    await joinRoom(guest, code, 'Blue Team')
    await expect(guest).toHaveURL(new RegExp(`/rooms/${slug}$`))

    await page.goto(`/rooms/${slug}/admin/members`)
    await expect(page.getByText(guestAlias).first()).toBeVisible({ timeout: 15000 })
  } finally {
    await guest.close()
  }
})

test('non-members are bounced to the join page', async ({ page, browser }) => {
  const hostAlias = uniqueAlias('e2eownr')
  await signUp(page, hostAlias)
  const slug = await createRoom(page, `Closed Room ${hostAlias}`)

  const stranger = await browser.newPage()
  try {
    await signUp(stranger, uniqueAlias('e2estrng'))
    await stranger.goto(`/rooms/${slug}`)
    await expect(stranger).toHaveURL(new RegExp(`/rooms/${slug}/join`))
  } finally {
    await stranger.close()
  }
})

test('banned members cannot rejoin', async ({
  page,
  browser,
}: {
  page: Page
  browser: Browser
}) => {
  const hostAlias = uniqueAlias('e2eownb')
  await signUp(page, hostAlias)
  const slug = await createRoom(page, `Ban Room ${hostAlias}`)
  const code = await readJoinCode(page, slug)
  await createTeam(page, slug, 'Green Team')

  const guest = await browser.newPage()
  try {
    const guestAlias = uniqueAlias('e2ebanned')
    await signUp(guest, guestAlias)
    await joinRoom(guest, code, 'Green Team')
    await expect(guest).toHaveURL(new RegExp(`/rooms/${slug}$`))

    await page.goto(`/rooms/${slug}/admin/members`)
    const row = page.getByRole('row', { name: new RegExp(guestAlias) })
    await row.getByRole('button', { name: /ban member/i }).click()
    await expect(page.getByText(guestAlias).first()).toBeVisible({ timeout: 15000 })

    await guest.goto(`/rooms/join?code=${code}`)
    await guest.waitForTimeout(1000)
    await guest.getByRole('button', { name: /select a team/i }).click()
    await guest.getByRole('listbox').getByRole('option', { name: 'Green Team' }).click()
    await guest.getByRole('button', { name: /^join room/i }).click()
    await expect(guest.getByText(/cannot join this room/i)).toBeVisible({ timeout: 15000 })
  } finally {
    await guest.close()
  }
})

test('seeded root hosts the default room and cannot submit its flags', async ({ page }) => {
  await signIn(page, 'root', 'ctf-demo-1234')
  await expect(page).toHaveURL('/rooms')

  await page.goto('/rooms/acd-ctf/admin')
  await expect(page.getByText(/RM-[A-Z2-9]{6}/).first()).toBeVisible({ timeout: 15000 })

  await page.goto('/rooms/acd-ctf/play')
  await expect(page).toHaveURL(/\/rooms\/acd-ctf\/admin/)
})
