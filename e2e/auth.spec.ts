import { test, expect } from "@playwright/test";

test.describe("Authentication and Navigation", () => {
  test("should redirect unauthenticated users to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('button:has-text("Mit Keycloak anmelden")')).toBeVisible();
  });

  test("should successfully log in via test-login bypass and logout", async ({ page }) => {
    // Use our backend test-login bypass to log in instantly
    await page.goto("http://localhost:3000/auth/test-login?username=TestPlayer&sub=test-sub-123");
    
    // Now navigate to frontend home page
    await page.goto("/");
    
    // Verify we are logged in and see the level select page
    await expect(page).toHaveURL("/");
    await expect(page.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // Verify user name is shown in the header
    await expect(page.getByTitle("Abmelden")).toContainText("TestPlayer");

    // Click logout
    await page.getByTitle("Abmelden").click();
    
    // Should be redirected back to the login page
    await expect(page).toHaveURL(/\/login/);
  });
});
