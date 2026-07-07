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

// Function so strings are re-evaluated with current locale on each call
export function getLevelRules(t: (k: string) => string): Record<number, LevelRulesConfig> {
  return {
    0: {
      levelName: t("Level 0 — Klassisch"),
      subtitle: t("Die originalen Regeln des Spiels"),
      comingSoon: false,
      rules: [
        { title: t("Ziel des Spiels"), description: t("Bewege alle 4 deiner Figuren vom Start ins Ziel. Wer zuerst alle Figuren im Ziel hat, gewinnt.") },
        { title: t("Einsetzen"), description: t("Eine Figur darf nur aus dem Haus auf das Spielfeld, wenn du eine 6 würfelst. Bei einer 6 darfst du nochmal würfeln.") },
        { title: t("Bewegen"), description: t("Du bewegst eine deiner Figuren um die gewürfelte Zahl vorwärts. Du kannst wählen, welche Figur du ziehst.") },
        { title: t("Schlagen"), description: t("Landet deine Figur auf einem Feld, das von einer gegnerischen Figur besetzt ist, wird diese geschlagen und muss zurück ins Haus.") },
        { title: t("Sichere Felder"), description: t("Die farbigen Startfelder sind geschützt — dort können Figuren nicht geschlagen werden.") },
        { title: t("Zieleinlauf"), description: t("Figuren laufen im Uhrzeigersinn und biegen in die farbige Zielgasse ein. Die genaue Augenzahl muss erreicht werden, um ins Ziel zu kommen.") },
        { title: t("Zugpflicht"), description: t("Du musst ziehen, wenn es möglich ist. Hast du keine Figur auf dem Feld und würfelst keine 6, setzt du aus.") },
      ],
    },
    1: {
      levelName: t("Level 1 — Erweiterung I"),
      subtitle: t("Eine zusätzliche Regel ändert alles"),
      comingSoon: true,
      rules: [
        { title: t("Nochmal würfeln bei 6"), description: t("Wer eine 6 würfelt, darf nach dem Zug nochmal würfeln — und das so oft, bis keine 6 mehr fällt.") },
      ],
    },
    2: {
      levelName: t("Level 2 — Erweiterung II"),
      subtitle: t("Zwei Erweiterungen kombiniert"),
      comingSoon: true,
      rules: [
        { title: t("Dreimal Sechs = Zug verloren"), description: t("Wer dreimal hintereinander eine 6 würfelt, verliert seinen Zug und die letzte Figur muss zurück ins Haus.") },
      ],
    },
    3: {
      levelName: t("Level 3 — Vollständig"),
      subtitle: t("Alle Erweiterungen aktiv"),
      comingSoon: true,
      rules: [
        { title: t("Alle Regeln aktiv"), description: t("Level 3 kombiniert alle Erweiterungen aus Level 1 und Level 2 für das ultimative Spielerlebnis.") },
      ],
    },
  };
}
