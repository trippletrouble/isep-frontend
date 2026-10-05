# HAW Hof Ludo Game 2.0: Frontend

Ludo für mehrere Spieler im Browser. Man trifft sich in einer Lobby, würfelt und zieht, und alle sehen jeden Zug sofort. Dazu kommen Quiz-Duelle und eine eigene Spielregel, die „Fliege“: Sie befällt Figuren und bremst sie aus.

## Funktionen

- Lobby mit Einladungslink
- Spielbrett, das mögliche Züge hervorhebt
- Live-Updates per Server-Sent Events
- Quiz-Duelle und Rangliste
- Login mit dem Hochschulkonto über Keycloak

## Technik

React, TypeScript, Vite, Tailwind CSS, shadcn/ui. Unit-Tests mit Vitest, End-to-End-Tests mit Playwright. Das Backend liegt in [isep-backend](https://github.com/trippletrouble/isep-backend).

## Mein Beitrag

Ich habe die API-Schicht und das State-Management mit der SSE-Anbindung geschrieben und das Frontend an die OpenAPI-Spezifikation angeglichen. Die Fliegen-Regel habe ich im Frontend umgesetzt, dazu einen Sandbox-Modus zum lokalen Testen ohne Login. Außerdem habe ich die Tests mit Vitest und Playwright aufgesetzt.

## Lokal starten

```bash
npm install
npm run dev
npm test
```

Interdisziplinäres Softwareentwicklungsprojekt, Hochschule Hof, 2026.
