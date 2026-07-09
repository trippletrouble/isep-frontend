import { test, expect } from "@playwright/test";

test.describe("Quiz Duel E2E Gameplay", () => {
  test("should trigger and resolve a quiz duel when a capture conflict occurs", async ({ browser }) => {
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
    console.log("Logging in QuizHost...");
    await hostPage.goto("http://localhost:3000/auth/test-login?username=QuizHost&sub=host-quiz-123");
    await hostPage.goto("/");
    await expect(hostPage.locator('h1:has-text("Spiellevel")')).toBeVisible();

    console.log("Logging in QuizGuest...");
    await guestPage.goto("http://localhost:3000/auth/test-login?username=QuizGuest&sub=guest-quiz-456");
    await guestPage.goto("/");
    await expect(guestPage.locator('h1:has-text("Spiellevel")')).toBeVisible();

    // 3. Host player navigates to Level 1 (Quiz-Duell active)
    console.log("HostPlayer creating a Level 1 lobby...");
    await hostPage.locator('h3:has-text("Level 1")').click();
    await hostPage.locator('xpath=//h3[contains(text(),"Level 1")]/ancestor::div[contains(@class,"transition-all")]//button[contains(text(),"Spielen")]').click();
    await expect(hostPage).toHaveURL(/\/lobby\/level-1/);

    // Host fills name and creates lobby
    await hostPage.fill('input[placeholder="Dein Name"]', "QuizHost");
    
    // Select 2 players
    await hostPage.click('button:has-text("4 Spieler")');
    await hostPage.getByRole("option", { name: "2 Spieler" }).click();

    // Verify Quiz-Duell switch is active by default
    const quizSwitch = hostPage.locator('button[role="switch"]').last();
    await expect(quizSwitch).toBeChecked();
    
    // Click Create
    await hostPage.getByRole("button", { name: "Erstellen", exact: true }).click();

    // Wait for redirect and extract session ID
    await expect(hostPage).toHaveURL(/\/lobby\/[a-f0-9-]+/);
    const lobbyUrl = hostPage.url();
    const sessionId = lobbyUrl.split("/").pop()!;
    console.log(`Lobby created with Session ID: ${sessionId}`);

    // 4. Guest player joins the lobby
    console.log("GuestPlayer joining the lobby...");
    await guestPage.locator('h3:has-text("Level 1")').click();
    await guestPage.locator('xpath=//h3[contains(text(),"Level 1")]/ancestor::div[contains(@class,"transition-all")]//button[contains(text(),"Spielen")]').click();
    await expect(guestPage).toHaveURL(/\/lobby\/level-1/);

    await guestPage.click('button:has-text("Lobby beitreten")');
    await guestPage.fill('input[placeholder="Dein Name"]', "QuizGuest");
    await guestPage.fill('input[placeholder="Lobby-Code"]', sessionId);
    await guestPage.getByRole("button", { name: "Beitreten", exact: true }).click();

    await expect(guestPage).toHaveURL(new RegExp(`/lobby/${sessionId}`));

    // Verify both players are visible in the lobby list on Host screen
    await expect(hostPage.locator('main').locator('span:has-text("QuizHost")')).toBeVisible();
    await expect(hostPage.locator('main').locator('span:has-text("QuizGuest")')).toBeVisible();

    // 5. Host starts the game
    console.log("HostPlayer starting the game...");
    await hostPage.click('button:has-text("Spiel starten")');

    await expect(hostPage).toHaveURL(new RegExp(`/game/${sessionId}`));
    await expect(guestPage).toHaveURL(new RegExp(`/game/${sessionId}`));

    // Wait for the board to render
    await expect(hostPage.locator('svg[viewBox="0 0 1571 1573"]')).toBeVisible();
    await expect(guestPage.locator('svg[viewBox="0 0 1571 1573"]')).toBeVisible();

    // 6. Queue cheat rolls depending on who goes first
    // Host starts at RED field 0, Guest starts at BLUE field 13.
    // If Host goes first: Host: 6, 6, 3 (ends at 9). Guest: 6, 2 (ends at 15). Host: 6 (moves 9 -> 15, collides!).
    // If Guest goes first: Guest: 6, 2 (ends at 15). Host: 6, 6, 3 (ends at 9). Guest: 1 (ends at 16). Host: 6, 1 (moves 9 -> 15 -> 16, collides!).
    const hostWaiting = !(await hostPage.locator('span', { hasText: "QuizHost" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible());
    const guestFirst = hostWaiting;

    let cheatValues: number[];
    if (guestFirst) {
      console.log("GuestPlayer goes first! Queuing Guest-first cheat rolls...");
      cheatValues = [6, 1, 6, 6, 6, 6, 6, 3];
    } else {
      console.log("HostPlayer goes first! Queuing Host-first cheat rolls...");
      cheatValues = [6, 1, 6, 6, 6, 6, 6, 2];
    }

    // Call the cheat-roll endpoint
    const response = await hostPage.request.post(`http://localhost:3000/sessions/${sessionId}/cheat-roll`, {
      data: { values: cheatValues }
    });
    console.log(`Cheat rolls queued successfully! Status: ${response.status()}`);

    // 7. Play turns until Quiz Duel triggers
    console.log("Playing turns to trigger Quiz Duel...");
    let quizTriggered = false;

    for (let step = 1; step <= 25; step++) {
      // Check if the Quiz Duel overlay is visible on either screen
      const hostQuizVisible = await hostPage.locator('h2:has-text("QUIZDUELL")').filter({ visible: true }).isVisible();
      const guestQuizVisible = await guestPage.locator('h2:has-text("QUIZDUELL")').filter({ visible: true }).isVisible();

      if (hostQuizVisible || guestQuizVisible) {
        console.log("Quiz Duel triggered successfully!");
        quizTriggered = true;
        break;
      }

      // Detect active player
      const isHostTurn = await hostPage.locator('h2:has-text("Leaderboard") ~ div').locator('span', { hasText: "QuizHost" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible();
      const isGuestTurn = await guestPage.locator('h2:has-text("Leaderboard") ~ div').locator('span', { hasText: "QuizGuest" }).filter({ visible: true }).first().locator('xpath=..').locator('.animate-ping').first().isVisible();

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

      // Check if they need to roll or move
      const rollButton = activePage.getByRole("button", { name: "WÜRFEL WERFEN", exact: true }).filter({ visible: true });
      const rollEnabled = await rollButton.isEnabled();

      if (rollEnabled) {
        console.log(`[Step ${step}] ${activeName} rolling dice...`);
        await rollButton.click();
        await hostPage.waitForTimeout(2000);
      } else {
        console.log(`[Step ${step}] ${activeName} moving figure...`);
        const color = activeName === "HostPlayer"
          ? "#DB5757"
          : (await activePage.locator('circle[data-testid="figure"][data-color="#EBE036"]').first().isVisible() ? "#EBE036" : "#577CDB");
        const figure = activePage.locator(`circle[data-testid="figure"][data-color="${color}"]`).first();
        
        if (await figure.isVisible()) {
          await figure.click();
          await hostPage.waitForTimeout(800);
          
          const targetTile = activePage.locator('circle[data-testid="target-tile"]');
          if (await targetTile.isVisible()) {
            await targetTile.click({ force: true });
            await hostPage.waitForTimeout(2000);
          } else {
            console.log("No possible moves highlighted for figure.");
            await hostPage.waitForTimeout(500);
          }
        }
      }
    }

    expect(quizTriggered).toBe(true);

    // 8. Submit different quiz answers on screens to ensure a decisive win/loss
    console.log("Host player submitting answer A...");
    const hostOptionA = hostPage.getByRole("button").filter({ hasText: "A" }).filter({ visible: true }).first();
    await hostOptionA.click();

    console.log("Guest player submitting answer B...");
    const guestOptionB = guestPage.getByRole("button").filter({ hasText: "B" }).filter({ visible: true }).first();
    await guestOptionB.click();

    // Wait for the duel results to propagate and the overlay status to update
    console.log("Waiting for winner/loser/draw overlay banners to be rendered...");
    await expect(
      hostPage.locator('text=DU HAST GEWONNEN!').first()
        .or(hostPage.locator('text=GEGNER HAT GEWONNEN!').first())
        .or(hostPage.locator('text=UNENTSCHIEDEN!').first())
        .or(hostPage.locator('text=KEINER HAT RECHT!').first())
    ).toBeVisible({ timeout: 8000 });

    const hostWon = await hostPage.locator('text=DU HAST GEWONNEN!').first().isVisible();
    const guestWon = await guestPage.locator('text=DU HAST GEWONNEN!').first().isVisible();
    const hostLost = await hostPage.locator('text=GEGNER HAT GEWONNEN!').first().isVisible();
    const guestLost = await guestPage.locator('text=GEGNER HAT GEWONNEN!').first().isVisible();
    const draw = await hostPage.locator('text=UNENTSCHIEDEN!').first().isVisible();
    const neither = await hostPage.locator('text=KEINER HAT RECHT!').first().isVisible();

    console.log(`Host state: won=${hostWon}, lost=${hostLost}. Guest state: won=${guestWon}, lost=${guestLost}. Draw=${draw}, Neither=${neither}`);
    expect(hostWon || guestWon || draw || neither).toBe(true);

    // 9. Wait for duel resolution and dialog to close
    console.log("Waiting for Quiz Duel to resolve and dialog to close...");
    const hostClose = hostPage.getByRole("button", { name: /Schließen|Close/i }).first();
    if (await hostClose.isVisible()) {
      await hostClose.click();
    }
    const guestClose = guestPage.getByRole("button", { name: /Schließen|Close/i }).first();
    if (await guestClose.isVisible()) {
      await guestClose.click();
    }

    await expect(hostPage.locator('h2:has-text("QUIZDUELL")')).not.toBeVisible({ timeout: 8000 });
    await expect(guestPage.locator('h2:has-text("QUIZDUELL")')).not.toBeVisible({ timeout: 8000 });
    console.log("Quiz Duel resolved and closed successfully!");

    // 10. Query backend session to verify the loser's figure has been kicked back to HOME (-1)
    const cookies = await hostPage.context().cookies();
    console.log(`[DEBUG] COOKIES FOUND: ${JSON.stringify(cookies)}`);
    const sessionCookie = cookies.find(c => c.name === "session")?.value;

    const sessionResponse = await hostPage.request.get(`http://localhost:3000/sessions/${sessionId}`, {
      headers: {
        "Cookie": `session=${sessionCookie}`
      }
    });
    const sessionData = await sessionResponse.json();
    const game = sessionData.data;

    const hostPlayer = game.players.find((p: any) => p.username === "QuizHost");
    const guestPlayer = game.players.find((p: any) => p.username === "QuizGuest");

    const hostIsHome = game.figures.filter((f: any) => f.playerId === hostPlayer.id).every((f: any) => f.position === -1);
    const guestIsHome = game.figures.filter((f: any) => f.playerId === guestPlayer.id).every((f: any) => f.position === -1);
    
    console.log(`Figures home status -> Host: ${hostIsHome}, Guest: ${guestIsHome}`);
    expect(hostIsHome || guestIsHome).toBe(true);

    // Clean up browser contexts
    await hostContext.close();
    await guestContext.close();
  });
});
