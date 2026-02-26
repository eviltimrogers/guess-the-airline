import { test, expect, type Page } from '@playwright/test';

/** Wait for the game to be fully loaded and return the correct answer's ID. */
async function getCorrectAnswerId(page: Page): Promise<string> {
  await page.waitForFunction(() => (window as any).__currentCorrectAnswer?.id);
  return page.evaluate(() => (window as any).__currentCorrectAnswer.id);
}

test.describe('Guess the Airline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('.option-button');
  });

  test('displays the game UI on load', async ({ page }) => {
    await expect(page).toHaveTitle('Guess the Airline');
    await expect(page.locator('h1')).toContainText('GUESS THE AIRLINE');
    await expect(page.locator('.score')).toContainText('SCORE: 0 / 0');
    await expect(page.locator('#iata-code')).toBeVisible();
    await expect(page.locator('.option-button')).toHaveCount(4);
  });

  test('shows an IATA code with 2-3 characters', async ({ page }) => {
    const code = await page.locator('#iata-code').textContent();
    expect(code).toBeTruthy();
    expect(code!.trim().length).toBeGreaterThanOrEqual(2);
    expect(code!.trim().length).toBeLessThanOrEqual(3);
  });

  test('updates score and shows feedback on correct answer', async ({ page }) => {
    const correctId = await getCorrectAnswerId(page);

    await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();

    await expect(page.locator('#feedback')).toHaveText('CORRECT!');
    await expect(page.locator('#feedback')).toHaveClass(/correct/);
    await expect(page.locator('.score')).toContainText('SCORE: 1 / 1');
    await expect(page.locator('#next-button')).toBeVisible();
  });

  test('shows feedback and highlights correct answer on wrong answer', async ({ page }) => {
    const correctId = await getCorrectAnswerId(page);

    const wrongButton = page.locator(`.option-button:not([data-airline-id="${correctId}"])`).first();
    await wrongButton.click();

    await expect(wrongButton).toHaveClass(/incorrect/);
    await expect(page.locator(`.option-button[data-airline-id="${correctId}"]`)).toHaveClass(/correct/);
    await expect(page.locator('#feedback')).toHaveClass(/incorrect/);
    await expect(page.locator('#feedback')).toContainText('WRONG!');
    await expect(page.locator('.score')).toContainText('SCORE: 0 / 1');
  });

  test('disables all buttons after answering', async ({ page }) => {
    const correctId = await getCorrectAnswerId(page);
    await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();

    const buttons = page.locator('.option-button');
    for (let i = 0; i < 4; i++) {
      await expect(buttons.nth(i)).toBeDisabled();
    }
  });

  test('loads a new question when clicking Next', async ({ page }) => {
    const correctId = await getCorrectAnswerId(page);
    await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();

    await page.locator('#next-button').click();

    await expect(page.locator('.option-button').first()).toBeEnabled();
    await expect(page.locator('#feedback')).toHaveText('');
    await expect(page.locator('.score')).toContainText('/ 1');
  });

  test('tracks streak with combo text', async ({ page }) => {
    for (let round = 1; round <= 2; round++) {
      const correctId = await getCorrectAnswerId(page);
      await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();

      if (round === 2) {
        await expect(page.locator('#feedback')).toContainText('2x COMBO');
      }

      if (round < 2) {
        await page.locator('#next-button').click();
      }
    }
  });

  test('resets streak after wrong answer', async ({ page }) => {
    // First: answer correctly
    let correctId = await getCorrectAnswerId(page);
    await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();
    await page.locator('#next-button').click();

    // Second: answer incorrectly
    correctId = await getCorrectAnswerId(page);
    await page.locator(`.option-button:not([data-airline-id="${correctId}"])`).first().click();
    await page.locator('#next-button').click();

    // Third: answer correctly — should NOT show combo (streak was reset)
    correctId = await getCorrectAnswerId(page);
    await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();
    await expect(page.locator('#feedback')).toHaveText('CORRECT!');
  });

  test('updates hi-score when current score exceeds it', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('airline-hi-score'));
    await page.reload();
    await page.waitForSelector('.option-button');

    await expect(page.locator('#hi-score')).toHaveText('0');

    const correctId = await getCorrectAnswerId(page);
    await page.locator(`.option-button[data-airline-id="${correctId}"]`).click();

    await expect(page.locator('#hi-score')).toHaveText('1');
  });

  test('displays mute button', async ({ page }) => {
    await expect(page.locator('#mute-button')).toBeVisible();
  });

  test('mute button toggles muted state and persists to localStorage', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('airline-muted'));
    await page.reload();
    await page.waitForSelector('.option-button');

    const muteBtn = page.locator('#mute-button');
    await expect(muteBtn).not.toHaveClass(/muted/);

    await muteBtn.click();
    await expect(muteBtn).toHaveClass(/muted/);
    const stored = await page.evaluate(() => localStorage.getItem('airline-muted'));
    expect(stored).toBe('true');

    await muteBtn.click();
    await expect(muteBtn).not.toHaveClass(/muted/);
    const stored2 = await page.evaluate(() => localStorage.getItem('airline-muted'));
    expect(stored2).toBe('false');
  });

  test('mute preference is restored from localStorage on reload', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('airline-muted', 'true'));
    await page.reload();
    await page.waitForSelector('.option-button');

    await expect(page.locator('#mute-button')).toHaveClass(/muted/);
  });
});
