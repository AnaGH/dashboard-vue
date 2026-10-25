import { test, expect } from '@playwright/test'

test('redirects to the production dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Production dashboard' })).toBeVisible()
})
