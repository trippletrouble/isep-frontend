import { test, expect } from "@playwright/test";

test.describe("Plague Fly E2E Gameplay", () => {
  test("should assign a plague fly on rolling a 1 and show debuffs/indicators", async ({ browser }) => {
    test.setTimeout(90000);

    // 1. Create two isolated browser contexts
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    // Attach console listeners for debugging
    hostPage.on("console", msg => console.log(`[HOST BROWSER] ${msg.text()}`));
    guestPage.on("console", msg => console.log(`[GUEST BROWSER] ${msg.text()}`));

    // 2. Log in both players
    console.log("Logging in Host...");
    await hostPage.goto("http://localhost:3000/auth/test-login?username=PlagueHost&sub=host-plague-123");
    await hostPage.goto("/");
    await expect(hostPage.locator('h1:has-text("Spiellevel")')).toBeVisible();

    console.log("Logging in Guest...");
    await guestPage.goto("http://localhost:3000/auth/test-login?username=PlagueGuest&sub=guest-plague-456");
    await guestPage.goto("/");
    await expect(guestPage.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // 3. Host player navigates to Level 3 (Plague Fly active)
    console.log("HostPlayer creating a Level 3 lobby...");
    await hostPage.locator('h3:has-text("Level 3")').click();
    await hostPage.locator('xpath=//h3[contains(text(),"Level 3")]/ancestor::div[contains(@class,"transition-all")]//button[contains(text(),"Spielen")]').click();
    await expect(hostPage).toHaveURL(/\/lobby\/level-3/);

    // Host fills name and creates lobby
    await hostPage.fill('input[placeholder="Dein Name"]', "PlagueHost");
    
    // Select 2 players
    await hostPage.click('button:has-text("4 Spieler")');
    await hostPage.getByRole("option", { name: "2 Spieler" }).click();

    // Verify Pestfliege switch is active by default
    const plagueSwitch = hostPage.locator('button[role="switch"]').last();
    await expect(plagueSwitch).toBeChecked();

    // Click Create
    await hostPage.getByRole("button", { name: "Erstellen", exact: true }).click();

    // Wait for redirect and extract session ID
    await expect(hostPage).toHaveURL(/\/lobby\/[a-f0-9-]+/);
    const lobbyUrl = hostPage.url();
    const sessionId = lobbyUrl.split("/").pop()!;
    console.log(`Lobby created with Session ID: ${sessionId}`);

    // 4. Guest player joins the lobby
    console.log("GuestPlayer joining the lobby...");
    await guestPage.locator('h3:has-text("Level 3")').click();
    await guestPage.locator('xpath=//h3[contains(text(),"Level 3")]/ancestor::div[contains(@class,"transition-all")]//button[contains(text(),"Spielen")]').click();
    await expect(guestPage).toHaveURL(/\/lobby\/level-3/);

    await guestPage.click('button:has-text("Lobby beitreten")');
    await guestPage.fill('input[placeholder="Dein Name"]', "PlagueGuest");
    await guestPage.fill('input[placeholder="Lobby-Code"]', sessionId);
    await guestPage.getByRole("button", { name: "Beitreten", exact: true }).click();

    await expect(guestPage).toHaveURL(new RegExp(`/lobby/${sessionId}`));

    // 5. Host starts the game
    console.log("HostPlayer starting the game...");
    await hostPage.click('button:has-text("Spiel starten")');

    await expect(hostPage).toHaveURL(new RegExp(`/game/${sessionId}`));
    await expect(guestPage).toHaveURL(new RegExp(`/game/${sessionId}`));

    // Wait for the board to render
    await expect(hostPage.locator('svg[viewBox="0 0 1571 1573"]')).toBeVisible();
    await expect(guestPage.locator('svg[viewBox="0 0 1571 1573"]')).toBeVisible();

    // 6. Verify FLIEGEN section text is visible (verifies rule is active)
    await expect(hostPage.locator('span:has-text("FLIEGEN")').filter({ visible: true }).first()).toBeVisible();
    console.log("PLAGUE_FLY rule verified active on UI.");

    // 7. Queue cheat rolls
    // We roll:
    // Spawning player: 6 (spawns), 1 (lands on 1, gets fly)
    // Waiting player: 2 (cannot move, turn passes back)
    // Infected player: 5 (rolls 5, debuff is applied)
    const cheatValues = [6, 1, 2, 5];
    const response = await hostPage.request.post(`http://localhost:3000/sessions/${sessionId}/cheat-roll`, {
      data: { values: cheatValues }
    });
    console.log(`Cheat rolls queued successfully! Status: ${response.status()}`);

    // 8. Dynamic gameplay loop
    console.log("Starting play turns loop...");
    let flyAssigned = false;
    let debuffVerified = false;
    let flyPlayerColor = "";

    for (let step = 1; step <= 30; step++) {
      // Detect active player
      const isHostTurn = await hostPage.locator('span', { hasText: "PlagueHost" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible();
      const isGuestTurn = await guestPage.locator('span', { hasText: "PlagueGuest" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible();

      let activePage = hostPage;
      let activeName = "HostPlayer";

      if (isHostTurn) {
        activePage = hostPage;
        activeName = "HostPlayer";
      } else if (isGuestTurn) {
        activePage = guestPage;
        activeName = "GuestPlayer";
      } else {
        console.log(`[Step ${step}] Both waiting or screen loading...`);
        await hostPage.waitForTimeout(500);
        step--;
        continue;
      }

      // If fly is assigned and it's the turn of the infected player, and they have rolled the dice (roll button disabled):
      const rollButton = activePage.getByRole("button", { name: "WÜRFEL WERFEN", exact: true }).filter({ visible: true }).first();
      const rollEnabled = await rollButton.isEnabled();

      if (flyAssigned && !rollEnabled && flyPlayerColor) {
        const color = flyPlayerColor === "RED" ? "#DB5757" : "#EBE036";
        const figure = activePage.locator(`circle[data-testid="figure"][data-color="${color}"]`).first();
        if (await figure.isVisible()) {
          console.log(`Selecting infected figure for ${activeName} to verify debuff...`);
          await figure.click();
          await hostPage.waitForTimeout(1000);

          // Check if debuff badge is visible
          const debuffBadge = activePage.locator('div:has-text("-")').filter({ visible: true }).first();
          if (await debuffBadge.isVisible()) {
            const debuffText = await debuffBadge.innerText();
            console.log(`Success! Debuff badge detected: ${debuffText}`);
            expect(debuffText).toMatch(/-[1-3]/);
            debuffVerified = true;
            break;
          }
        }
      }

      if (rollEnabled) {
        console.log(`[Step ${step}] ${activeName} rolling dice...`);
        await rollButton.click();
        await hostPage.waitForTimeout(2000);
      } else {
        // Move figure
        console.log(`[Step ${step}] ${activeName} moving figure...`);
        const color = activeName === "HostPlayer" ? "#DB5757" : "#EBE036"; // RED or YELLOW
        const figure = activePage.locator(`circle[data-testid="figure"][data-color="${color}"]`).first();
        
        if (await figure.isVisible()) {
          await figure.click();
          await hostPage.waitForTimeout(800);
          
          const targetTile = activePage.locator('circle[data-testid="target-tile"]').first();
          if (await targetTile.isVisible()) {
            await targetTile.click({ force: true });
            await hostPage.waitForTimeout(2000);

            // The spawning player gets the fly after completing their second move (the '1' roll)
            if (step === 4) {
              console.log(`Fly should now be assigned to ${activeName}!`);
              flyAssigned = true;
              flyPlayerColor = activeName === "HostPlayer" ? "RED" : "YELLOW";
            }
          } else {
            console.log("No possible moves highlighted for figure.");
            await hostPage.waitForTimeout(500);
          }
        }
      }
    }

    expect(debuffVerified).toBe(true);

    // Clean up browser contexts
    await hostContext.close();
    await guestContext.close();
  });
});
