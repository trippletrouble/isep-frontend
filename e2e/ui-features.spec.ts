import { test, expect } from "@playwright/test";

test.describe("Frontend UI Features", () => {
  test("should login as guest player", async ({ page }) => {
    await page.goto("/login");
    
    // Click guest button
    await page.click('button:has-text("Gast-Modus (Ohne Login)")');

    // Verify redirection to level selection page
    await expect(page).toHaveURL("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Verify name starts with "Spieler_" in the header
    const headerText = await page.locator("header").innerText();
    expect(headerText).toContain("Spieler_");
  });

  test("should open and close rules dialog from level select page", async ({ page }) => {
    // Navigate via test-login bypass to get instant access
    await page.goto("http://localhost:3000/auth/test-login?username=RulesPlayer&sub=rules-sub-123");
    await page.goto("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Make sure Level 0 card is open/expanded
    await page.click('h3:has-text("Level 0")');

    // Click on rules button
    await page.click('button:has-text("Regeln")');

    // Check rules dialog shows
    const rulesDialog = page.locator('h2:has-text("Spielregeln")');
    await expect(rulesDialog).toBeVisible();
    await expect(page.locator('span:has-text("Level 0")')).toBeVisible();

    // Close the dialog using red X close button
    await page.locator('button.absolute.top-4.right-4').click();

    // Verify dialog is closed
    await expect(rulesDialog).not.toBeVisible();
  });

  test("should switch languages in settings dropdown and see translations update", async ({ page }) => {
    // Navigate via test-login bypass
    await page.goto("http://localhost:3000/auth/test-login?username=LangPlayer&sub=lang-sub-123");
    await page.goto("/");
    
    // Verify default language is German
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Click settings gear to open the settings dropdown
    await page.getByLabel("Einstellungen").click();

    // Verify settings dropdown content is visible
    await expect(page.locator('span:has-text("Abmelden")')).toBeVisible();

    // Click English language option in the dropdown
    await page.locator('[role="menuitem"]:has-text("English")').click();

    // Wait for dropdown to close completely
    await expect(page.locator('[role="menuitem"]:has-text("English")')).not.toBeVisible();

    // Verify page header translated to "Game Levels"
    await expect(page.locator('h1:has-text("Game Levels")')).toBeVisible();

    // Open settings dropdown again (which is now in English, so label changes)
    await page.getByLabel("Settings").click();

    // Click Deutsch to restore to German
    await page.locator('[role="menuitem"]:has-text("Deutsch")').click();

    // Wait for dropdown to close completely
    await expect(page.locator('[role="menuitem"]:has-text("Deutsch")')).not.toBeVisible();

    // Verify page header translated back to "Spiellevel"
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();
  });

  test("should open invite dialog and click copy", async ({ browser }) => {
    // Grant clipboard permissions to the browser context
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();

    // Navigate via test-login bypass
    await page.goto("http://localhost:3000/auth/test-login?username=HostInvite&sub=invite-sub-123");
    await page.goto("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Host player navigates to Level 0 and opens the lobby creation card
    await page.click('h3:has-text("Level 0")');
    await page.click('button:has-text("Spielen")');
    await expect(page).toHaveURL(/\/lobby\/level-0/);

    // Host fills name and creates the lobby
    await page.fill('input[placeholder="Dein Name"]', "HostInvite");
    await page.getByRole("button", { name: "Erstellen", exact: true }).click();

    // Wait until redirected to the lobby session URL
    await expect(page).toHaveURL(/\/lobby\/[a-f0-9-]+/);

    // Click "Einladen" button
    await page.click('button:has-text("Einladen")');

    // Verify invite link info box is visible
    await expect(page.locator('span:has-text("Lobby-Code:")')).toBeVisible();
    await expect(page.locator('span:has-text("Einladungslink:")')).toBeVisible();

    // Verify copy success toast is displayed
    await expect(page.getByText("Einladungslink in die Zwischenablage kopiert")).toBeVisible();
  });

  test("should leave lobby immediately on click and return to home", async ({ page }) => {
    // Navigate via test-login bypass
    await page.goto("http://localhost:3000/auth/test-login?username=HostLeave&sub=leave-sub-123");
    await page.goto("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Create lobby
    await page.click('h3:has-text("Level 0")');
    await page.click('button:has-text("Spielen")');
    await page.fill('input[placeholder="Dein Name"]', "HostLeave");
    await page.getByRole("button", { name: "Erstellen", exact: true }).click();
    await expect(page).toHaveURL(/\/lobby\/[a-f0-9-]+/);

    // Click "Lobby verlassen"
    await page.click('button:has-text("Lobby verlassen")');

    // Verify redirected back to home immediately
    await expect(page).toHaveURL("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();
  });

  test("should show error toast on invalid lobby code and disable join button on empty name", async ({ page }) => {
    // Navigate via test-login bypass
    await page.goto("http://localhost:3000/auth/test-login?username=ValidationPlayer&sub=val-sub-123");
    await page.goto("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Open join lobby dialog
    await page.click('h3:has-text("Level 0")');
    await page.click('button:has-text("Spielen")');
    await page.click('button:has-text("Lobby beitreten")');
    await expect(page.locator('h2:has-text("Lobby beitreten")')).toBeVisible();

    // Clear playerName input completely, scoped inside the dialog to avoid strict mode violations
    const nameInput = page.locator('[role="dialog"] input[placeholder="Dein Name"]');
    await nameInput.fill("");

    // Verify "Beitreten" button is disabled
    const joinButton = page.locator('[role="dialog"] button:has-text("Beitreten")');
    await expect(joinButton).toBeDisabled();

    // Fill playerName but keep lobby code empty (button should remain disabled)
    await nameInput.fill("ValidationPlayer");
    await expect(joinButton).toBeDisabled();

    // Fill lobby code with an invalid code to enable the button and trigger submission error
    const codeInput = page.locator('[role="dialog"] input[placeholder="Lobby-Code"]');
    await codeInput.fill("invalid-code-123");
    await expect(joinButton).toBeEnabled();

    // Click "Beitreten"
    await joinButton.click();

    // Verify toast error is shown (either "Lobby nicht gefunden" or general error)
    await expect(page.getByText("Lobby nicht gefunden").or(page.getByText("Fehler"))).toBeVisible();

    // Close join dialog
    await page.click('button[aria-label="Lobby beitreten schließen"]');
    await expect(page.locator('h2:has-text("Lobby beitreten")')).not.toBeVisible();
  });
});
