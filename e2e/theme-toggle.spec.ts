import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('.option-button');
  });

  test('displays the theme toggle button', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveText('☀️');
  });

  test('switches to light mode when toggle is clicked', async ({ page }) => {
    await page.locator('#theme-toggle').click();

    await expect(page.locator('body')).toHaveClass(/light-mode/);
    await expect(page.locator('#theme-toggle')).toHaveText('🌙');
  });

  test('switches back to dark mode on second click', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');

    await toggle.click();
    await expect(page.locator('body')).toHaveClass(/light-mode/);

    await toggle.click();
    await expect(page.locator('body')).not.toHaveClass(/light-mode/);
    await expect(toggle).toHaveText('☀️');
  });

  test('persists light mode preference across reloads', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await expect(page.locator('body')).toHaveClass(/light-mode/);

    await page.reload();
    await page.waitForSelector('.option-button');

    await expect(page.locator('body')).toHaveClass(/light-mode/);
    await expect(page.locator('#theme-toggle')).toHaveText('🌙');
  });

  test('persists dark mode preference across reloads', async ({ page }) => {
    // Switch to light, then back to dark
    await page.locator('#theme-toggle').click();
    await page.locator('#theme-toggle').click();

    await page.reload();
    await page.waitForSelector('.option-button');

    await expect(page.locator('body')).not.toHaveClass(/light-mode/);
    await expect(page.locator('#theme-toggle')).toHaveText('☀️');
  });

  test('applies correct background color in light mode', async ({ page }) => {
    await page.locator('#theme-toggle').click();

    // Intentionally wrong: expects dark mode background color while in light mode
    const bgColor = await page.locator('body').evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(10, 10, 46)');
  });
});
