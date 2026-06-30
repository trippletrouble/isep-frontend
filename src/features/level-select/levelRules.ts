export interface LevelRule {
  title: string;
  description: string;
}

export interface LevelRulesConfig {
  levelName: string;
  subtitle: string;
  comingSoon: boolean;
  rules: LevelRule[];
}

export const LEVEL_RULES: Record<number, LevelRulesConfig> = {
  0: {
    levelName: "Level 0 — Klassisch",
    subtitle: "Die originalen Regeln des Spiels",
    comingSoon: false,
    rules: [
      {
        title: "Ziel des Spiels",
        description:
          "Bewege alle 4 deiner Figuren vom Start ins Ziel. Wer zuerst alle Figuren im Ziel hat, gewinnt.",
      },
      {
        title: "Einsetzen",
        description:
          "Eine Figur darf nur aus dem Haus auf das Spielfeld, wenn du eine 6 würfelst. Bei einer 6 darfst du nochmal würfeln.",
      },
      {
        title: "Bewegen",
        description:
          "Du bewegst eine deiner Figuren um die gewürfelte Zahl vorwärts. Du kannst wählen, welche Figur du ziehst.",
      },
      {
        title: "Schlagen",
        description:
          "Landet deine Figur auf einem Feld, das von einer gegnerischen Figur besetzt ist, wird diese geschlagen und muss zurück ins Haus.",
      },
      {
        title: "Sichere Felder",
        description:
          "Die farbigen Startfelder sind geschützt — dort können Figuren nicht geschlagen werden.",
      },
      {
        title: "Zieleinlauf",
        description:
          "Figuren laufen im Uhrzeigersinn und biegen in die farbige Zielgasse ein. Die genaue Augenzahl muss erreicht werden, um ins Ziel zu kommen.",
      },
      {
        title: "Zugpflicht",
        description:
          "Du musst ziehen, wenn es möglich ist. Hast du keine Figur auf dem Feld und würfelst keine 6, setzt du aus.",
      },
    ],
  },
  1: {
    levelName: "Level 1 — Erweiterung I",
    subtitle: "Eine zusätzliche Regel ändert alles",
    comingSoon: true,
    rules: [
      {
        title: "Nochmal würfeln bei 6",
        description:
          "Wer eine 6 würfelt, darf nach dem Zug nochmal würfeln — und das so oft, bis keine 6 mehr fällt.",
      },
    ],
  },
  2: {
    levelName: "Level 2 — Erweiterung II",
    subtitle: "Zwei Erweiterungen kombiniert",
    comingSoon: true,
    rules: [
      {
        title: "Dreimal Sechs = Zug verloren",
        description:
          "Wer dreimal hintereinander eine 6 würfelt, verliert seinen Zug und die letzte Figur muss zurück ins Haus.",
      },
    ],
  },
  3: {
    levelName: "Level 3 — Vollständig",
    subtitle: "Alle Erweiterungen aktiv",
    comingSoon: true,
    rules: [
      {
        title: "Alle Regeln aktiv",
        description:
          "Level 3 kombiniert alle Erweiterungen aus Level 1 und Level 2 für das ultimative Spielerlebnis.",
      },
    ],
  },
};
