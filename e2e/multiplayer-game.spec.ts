import { test, expect } from "@playwright/test";

test.describe("Multiplayer Lobby and Game Loop", () => {
  test("should allow host to create lobby, guest to join, and play turns", async ({ browser }) => {
    // 1. Create two isolated browser contexts for the players
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    // Attach console listeners for debugging browser states and SSE connectivity
    hostPage.on("console", msg => console.log(`[HOST BROWSER] ${msg.text()}`));
    guestPage.on("console", msg => console.log(`[GUEST BROWSER] ${msg.text()}`));
    hostPage.on("pageerror", err => console.log(`[HOST BROWSER ERR] ${err.message}`));
    guestPage.on("pageerror", err => console.log(`[GUEST BROWSER ERR] ${err.message}`));

    // 2. Authenticate both players using the test-login bypass
    console.log("Logging in HostPlayer...");
    await hostPage.goto("http://localhost:3000/auth/test-login?username=HostPlayer&sub=host-sub-123");
    await hostPage.goto("/");
    await expect(hostPage.locator('h1:has-text("Spiellevel")')).toBeVisible();

    console.log("Logging in GuestPlayer...");
    await guestPage.goto("http://localhost:3000/auth/test-login?username=GuestPlayer&sub=guest-sub-456");
    await guestPage.goto("/");
    await expect(guestPage.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // 3. Host player navigates to Level 0 and opens the lobby creation card
    console.log("HostPlayer creating a lobby...");
    await hostPage.click('h3:has-text("Level 0")');
    await hostPage.click('button:has-text("Spielen")');
    await expect(hostPage).toHaveURL(/\/lobby\/level-0/);

    // Host fills name, selects 2 Players and creates the lobby
    await hostPage.fill('input[placeholder="Dein Name"]', "HostPlayer");
    
    // Select 2 players from the Radix Select dropdown
    await hostPage.click('button:has-text("4 Spieler")'); // default dropdown value is 4
    await hostPage.getByRole("option", { name: "2 Spieler" }).click();
    
    // Click Create
    await hostPage.getByRole("button", { name: "Erstellen", exact: true }).click();

    // Wait until redirected to the lobby session URL and extract session ID
    await expect(hostPage).toHaveURL(/\/lobby\/[a-f0-9-]+/);
    const lobbyUrl = hostPage.url();
    const sessionId = lobbyUrl.split("/").pop()!;
    console.log(`Lobby created successfully with Session ID: ${sessionId}`);

    // 4. Guest player joins the lobby via UI modal
    console.log("GuestPlayer joining the lobby...");
    await guestPage.click('h3:has-text("Level 0")');
    await guestPage.click('button:has-text("Spielen")');
    await expect(guestPage).toHaveURL(/\/lobby\/level-0/);

    await guestPage.click('button:has-text("Lobby beitreten")');
    await guestPage.fill('input[placeholder="Dein Name"]', "GuestPlayer");
    await guestPage.fill('input[placeholder="Lobby-Code"]', sessionId);
    await guestPage.getByRole("button", { name: "Beitreten", exact: true }).click();

    // Verify both pages land in the same lobby session URL
    await expect(guestPage).toHaveURL(new RegExp(`/lobby/${sessionId}`));

    // Verify both players are visible in the lobby player list on both screens
    console.log("Verifying player lobby lists...");
    await expect(hostPage.locator('span:has-text("HostPlayer")')).toBeVisible();
    await expect(hostPage.locator('span:has-text("GuestPlayer")')).toBeVisible();
    await expect(guestPage.locator('span:has-text("HostPlayer")')).toBeVisible();
    await expect(guestPage.locator('span:has-text("GuestPlayer")')).toBeVisible();

    // 5. Host starts the game
    console.log("HostPlayer starting the game...");
    await hostPage.click('button:has-text("Spiel starten")');

    // Verify both players are redirected to the gameplay page
    console.log("Redirecting to game page...");
    await expect(hostPage).toHaveURL(new RegExp(`/game/${sessionId}`));
    await expect(guestPage).toHaveURL(new RegExp(`/game/${sessionId}`));

    // Verify game board is loaded on both pages
    await expect(hostPage.locator('svg[viewBox="0 0 1571 1573"]')).toBeVisible();
    await expect(guestPage.locator('svg[viewBox="0 0 1571 1573"]')).toBeVisible();

    // 6. Play some turns!
    // We will alternate rolls/moves 10 times to verify gameplay turn flow.
    console.log("Starting E2E game turn loop...");
    for (let step = 1; step <= 10; step++) {
      let activePage = hostPage;
      let activeName = "HostPlayer";

      // Detect which player is active: the one who has the pulsing dot on their row
      const isHostTurn = await hostPage.locator('span', { hasText: "HostPlayer" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible();
      const isGuestTurn = await guestPage.locator('span', { hasText: "GuestPlayer" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible();

      if (isHostTurn) {
        activePage = hostPage;
        activeName = "HostPlayer";
      } else if (isGuestTurn) {
        activePage = guestPage;
        activeName = "GuestPlayer";
      } else {
        console.log(`Step ${step}: Both waiting or game loading...`);
        await hostPage.waitForTimeout(1000);
        step--; // retry this step
        continue;
      }

      // Check if the roll button is enabled on the active player's page
      const rollButton = activePage.getByRole("button", { name: "WÜRFEL WERFEN", exact: true }).filter({ visible: true });
      const rollEnabled = await rollButton.isEnabled();

      if (rollEnabled) {
        console.log(`Step ${step}: ${activeName} is active and rolling dice...`);
        await rollButton.click();
        await hostPage.waitForTimeout(2500); // Wait for roll animation & state update
      } else {
        console.log(`Step ${step}: ${activeName} already rolled. Moving figure...`);
        
        // Find one of the active player's figures (Host is RED #DB5757, Guest is BLUE #577CDB)
        const color = activeName === "HostPlayer" ? "#DB5757" : "#577CDB";
        const figure = activePage.locator(`circle[data-testid="figure"][data-color="${color}"]`).first();
        
        if (await figure.isVisible()) {
          console.log(`Clicking figure for ${activeName}...`);
          await figure.click();
          await hostPage.waitForTimeout(800); // Wait for highlight animation

          // Check if target movement highlight circle is visible
          const targetTile = activePage.locator('circle[data-testid="target-tile"]');
          if (await targetTile.isVisible()) {
            console.log(`Target highlight tile visible. Clicking to execute move...`);
            await targetTile.click({ force: true });
            await hostPage.waitForTimeout(2500); // Wait for movement to finish
          } else {
            console.log(`No movement possible for this figure. Dice value didn't allow move.`);
            await hostPage.waitForTimeout(500);
          }
        }
      }
    }

    console.log("Multiplayer game loop completed successfully!");
    
    // Clean up browser contexts
    await hostContext.close();
    await guestContext.close();
  });
});
