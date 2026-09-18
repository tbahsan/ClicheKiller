import { test, expect } from '@playwright/test';

test.describe('ClicheKiller E2E Tests', () => {
  test('loads home page and detects clichés in default sample', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ClicheKiller/);
    await expect(page.locator('h1')).toContainText('ClicheKiller');

    // Corporate sample is loaded by default
    const metricCount = page.locator('#metric-count');
    await expect(metricCount).not.toHaveText('0');

    // Highlights should be rendered
    const marks = page.locator('mark.cliche-mark');
    await expect(marks.first()).toBeVisible();
  });

  test('clicking a cliché in sidebar opens suggestion card and replaces text on click', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#editor-input');
    await textarea.fill('At the end of the day, we won.');

    // Click on the match item in the sidebar list
    const matchItem = page.locator('.match-item').first();
    await expect(matchItem).toContainText('At the end of the day');
    await matchItem.click();

    // Suggestion card appears
    const card = page.locator('#suggestion-card');
    await expect(card).toBeVisible();
    await expect(page.locator('#card-phrase')).toContainText('At the end of the day');

    // Click the first replacement button ("ultimately")
    const replaceBtn = page.locator('#card-alternatives button').first();
    await replaceBtn.click();

    // Text in editor should now be updated to "Ultimately, we won."
    await expect(textarea).toHaveValue('Ultimately, we won.');

    // Cliché count should now drop to 0
    await expect(page.locator('#metric-count')).toHaveText('0');
    await expect(page.locator('#metric-health')).toContainText('Crisp & Clean');
  });

  test('toggling category filters updates detection dynamically', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#editor-input');
    await textarea.fill('We need to circle back on our low-hanging fruit.');

    // Both are corporate jargon: "circle back" and "low-hanging fruit"
    await expect(page.locator('#metric-count')).toHaveText('2');

    // Uncheck Corporate Jargon
    const businessToggle = page.locator('#cat-business_jargon');
    await businessToggle.uncheck();

    // Count should drop to 0 because that category is disabled
    await expect(page.locator('#metric-count')).toHaveText('0');

    // Re-check Corporate Jargon
    await businessToggle.check();
    await expect(page.locator('#metric-count')).toHaveText('2');
  });

  test('copy button provides visual feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    const copyBtn = page.locator('#copy-btn');
    await copyBtn.click();
    await expect(copyBtn).toContainText('Copied');
  });

  test('toggles dark and light mode', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
