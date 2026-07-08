import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, Plus, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResults, getHistory } from "@/api/gameplay.api";
import type { GameResults, GameHistoryEvent, PlayerColor } from "@/api/types";
import confetti from "canvas-confetti";
import { useTranslation } from "@/i18n";

const COLOR_HEX: Record<PlayerColor, string> = {
  RED: "#DB5757",
  BLUE: "#577CDB",
  GREEN: "#57DB8F",
  YELLOW: "#EBE036",
};

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
};

function DieFace({ value, faceColor, dotColor }: { value: number; faceColor: string; dotColor: string }) {
  const dots = DOT_POSITIONS[value] ?? [];
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="2" y="2" width="96" height="96" rx="18" fill={faceColor} />
      <rect x="2" y="2" width="96" height="96" rx="18" fill="white" fillOpacity="0.07" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={dotColor} />
      ))}
    </svg>
  );
}

const DICE_CONFIG = [
  { value: 6, color: "#57DB8F", dotColor: "#1a4a2e", top: "18%", floatAnim: "pawn-float 3.4s ease-in-out infinite" },
  { value: 3, color: "#EBE036", dotColor: "#4a3d00", top: "55%", floatAnim: "pawn-float-alt 4.2s ease-in-out infinite 0.6s" },
  { value: 1, color: "#577CDB", dotColor: "#0f1f4a", top: "22%", floatAnim: "pawn-float-slow 3.9s ease-in-out infinite 0.3s" },
  { value: 4, color: "#DB5757", dotColor: "#4a0f0f", top: "58%", floatAnim: "pawn-drift 4.6s ease-in-out infinite 1.0s" },
];

function InteractiveDie({ value, color, dotColor, top, floatAnim, side }: {
  value: number; color: string; dotColor: string; top: string;
  floatAnim: string; side: "left" | "right";
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const strength = Math.max(0, 1 - dist / 600);
      const rx = -(dy / rect.height) * 30 * strength;
      const ry = (dx / rect.width) * 30 * strength;
      el.style.transform = `perspective(300px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="absolute"
      style={{
        top,
        width: 90,
        height: 90,
        animation: floatAnim,
        left: side === "left" ? "50%" : undefined,
        right: side === "right" ? "50%" : undefined,
        translate: side === "left" ? "-50%" : "50%",
        filter: `drop-shadow(0 8px 28px ${color}66)`,
      }}
    >
      <div ref={innerRef} style={{ width: "100%", height: "100%", transition: "transform 0.1s ease-out" }}>
        <DieFace value={value} faceColor={color} dotColor={dotColor} />
      </div>
    </div>
  );
}

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

const PREVIEW_RESULTS: GameResults = {
  sessionId: "preview",
  finishedAt: new Date().toISOString(),
  durationSeconds: 427,
  totalTurns: 38,
  placements: [
    { rank: 1, playerId: "p1", username: "Alice", color: "GREEN", figuresInGoal: 4, figuresCaptured: 3 },
    { rank: 2, playerId: "p2", username: "Bob", color: "BLUE", figuresInGoal: 2, figuresCaptured: 1 },
    { rank: 3, playerId: "p3", username: "Carol", color: "RED", figuresInGoal: 1, figuresCaptured: 0 },
    { rank: 4, playerId: "p4", username: "Dave", color: "YELLOW", figuresInGoal: 0, figuresCaptured: 2 },
  ],
};

function useConfetti(trigger: boolean) {
  useEffect(() => {
    if (!trigger) return;
    const colors = ["#57DB8F", "#EBE036", "#577CDB", "#DB5757", "#ffffff"];
    const burst = () => {
      confetti({ particleCount: 120, spread: 100, origin: { x: 0.3, y: 0.4 }, colors, scalar: 1.2, gravity: 0.9 });
      confetti({ particleCount: 120, spread: 100, origin: { x: 0.7, y: 0.4 }, colors, scalar: 1.2, gravity: 0.9 });
    };
    burst();
    const t1 = setTimeout(burst, 600);
    const t2 = setTimeout(burst, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [trigger]);
}

export function GameResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [results, setResults] = useState<GameResults | null>(null);
  const [history, setHistory] = useState<GameHistoryEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [ready, setReady] = useState(false);

  const ACTION_LABELS: Record<string, string> = {
    ROLL: t("Würfelt"),
    MOVE: t("Zieht Figur"),
    CAPTURE: t("Schlägt Figur"),
    GOAL: t("Figur im Ziel"),
    GAME_START: t("Spiel gestartet"),
    GAME_END: t("Spiel beendet"),
  };

  useConfetti(ready);

  useEffect(() => {
    if (!sessionId) return;
    if (sessionId === "preview") {
      setResults(PREVIEW_RESULTS);
      return;
    }
    Promise.all([getResults(sessionId), getHistory(sessionId)])
      .then(([r, h]) => { setResults(r); setHistory(h); })
      .catch(() => navigate("/"));
  }, [sessionId]);

  useEffect(() => {
    if (!results) return;
    const t0 = setTimeout(() => setShowTitle(true), 100);
    const t1 = setTimeout(() => setVisibleRows(1), 600);
    const t2 = setTimeout(() => setVisibleRows(2), 900);
    const t3 = setTimeout(() => setVisibleRows(3), 1150);
    const t4 = setTimeout(() => setVisibleRows(4), 1350);
    const t5 = setTimeout(() => setReady(true), 700);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [results]);

  if (!results) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <span className="text-white text-2xl font-[family-name:var(--font-lilita)]">
          {t("Lade Ergebnis...")}
        </span>
      </div>
    );
  }

  const winner = results.placements.find((p) => p.rank === 1);

  return (
    <div className="relative flex flex-col items-center justify-center px-4 overflow-hidden">

      <div className="hidden lg:block fixed left-0 top-0 h-full pointer-events-none z-0" style={{ width: 120 }}>
        {DICE_CONFIG.slice(0, 2).map((d) => (
          <InteractiveDie key={d.value + d.color} {...d} side="left" />
        ))}
      </div>

      <div className="hidden lg:block fixed right-0 top-0 h-full pointer-events-none z-0" style={{ width: 120 }}>
        {DICE_CONFIG.slice(2).map((d) => (
          <InteractiveDie key={d.value + d.color} {...d} side="right" />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">

        <div
          className="text-center mb-2 transition-all duration-700"
          style={{ opacity: showTitle ? 1 : 0, transform: showTitle ? "translateY(0)" : "translateY(-24px)" }}
        >
          <h1 className="font-[family-name:var(--font-lilita)] text-white text-5xl md:text-6xl uppercase tracking-wide">
            {t("Spiel beendet")}
          </h1>
          <p className="text-[#ACACAC] font-[family-name:var(--font-afacad)] font-bold text-base mt-2">
            {results.totalTurns != null && `${results.totalTurns} ${t("Runden")} · `}
            {results.durationSeconds != null && formatDuration(results.durationSeconds)}
          </p>
        </div>

        {winner && (
          <div
            className="relative mb-5 rounded-[28px] p-5 flex items-center gap-4 overflow-hidden transition-all duration-700"
            style={{
              opacity: visibleRows >= 1 ? 1 : 0,
              transform: visibleRows >= 1 ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
              background: `linear-gradient(135deg, ${COLOR_HEX[winner.color]}22 0%, ${COLOR_HEX[winner.color]}08 100%)`,
              border: `1.5px solid ${COLOR_HEX[winner.color]}55`,
            }}
          >
            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: COLOR_HEX[winner.color] }} />

            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
              style={{ background: `${COLOR_HEX[winner.color]}33` }}>
              <Trophy size={30} style={{ color: COLOR_HEX[winner.color] }} />
            </div>

            <div className="flex-1 relative">
              <p className="font-[family-name:var(--font-lilita)] text-[#ACACAC] text-sm uppercase tracking-widest mb-0.5">
                {t("Gewinner")}
              </p>
              <p className="font-[family-name:var(--font-lilita)] text-white text-3xl uppercase tracking-wide leading-none">
                {winner.username}
              </p>
              <p className="font-[family-name:var(--font-afacad)] font-bold text-sm mt-1"
                style={{ color: COLOR_HEX[winner.color] }}>
                {winner.figuresInGoal}/4 {t("Figuren")} · {winner.figuresCaptured ?? 0} {t("geschlagen")}
              </p>
            </div>

            <span className="text-4xl relative">🏆</span>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-[28px] p-4 mb-4 flex flex-col gap-2">
          {results.placements.map((p, i) => (
            <div
              key={p.playerId}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500"
              style={{
                opacity: visibleRows > i ? 1 : 0,
                transform: visibleRows > i ? "translateX(0)" : "translateX(-32px)",
                background: p.rank === 1 ? `${COLOR_HEX[p.color]}15` : "rgba(255,255,255,0.04)",
                border: p.rank === 1 ? `1px solid ${COLOR_HEX[p.color]}40` : "1px solid transparent",
              }}
            >
              <span className="font-[family-name:var(--font-lilita)] text-xl w-8 text-center shrink-0">
                {p.rank <= 3 ? RANK_MEDAL[p.rank - 1] : <span className="text-[#ACACAC]">{p.rank}.</span>}
              </span>

              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLOR_HEX[p.color] }} />

              <span className="font-[family-name:var(--font-afacad)] font-bold text-white flex-1 text-lg">
                {p.username}
              </span>

              <div className="text-right font-[family-name:var(--font-afacad)] text-sm text-[#ACACAC]">
                <div>{p.figuresInGoal}/4 {t("Figuren")}</div>
                {p.figuresCaptured != null && <div>{p.figuresCaptured} {t("geschlagen")}</div>}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex gap-3 mb-4 transition-all duration-500"
          style={{
            opacity: visibleRows >= results.placements.length ? 1 : 0,
            transform: visibleRows >= results.placements.length ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <Button
            onClick={() => navigate("/lobby/1")}
            className="flex-1 bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] font-[family-name:var(--font-lilita)] text-lg h-14 rounded-[20px] uppercase tracking-wide"
          >
            <Plus size={20} className="mr-2" />
            {t("Neue Lobby")}
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/5 font-[family-name:var(--font-lilita)] text-lg h-14 rounded-[20px] uppercase tracking-wide"
          >
            <Home size={20} className="mr-2" />
            {t("Startseite")}
          </Button>
        </div>

        {history.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-6 py-4 text-white font-[family-name:var(--font-lilita)] text-lg uppercase tracking-wide hover:bg-white/5 transition-colors"
            >
              <span>{t("Spielverlauf ({0} Ereignisse)").replace("{0}", String(history.length))}</span>
              {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showHistory && (
              <div className="px-4 pb-4 max-h-80 overflow-y-auto flex flex-col gap-1">
                {history.slice(0, 100).map((e) => {
                  const isCapture = e.actionType === "CAPTURE";
                  return (
                    <div
                      key={e.eventId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-[family-name:var(--font-afacad)] ${
                        isCapture ? "bg-red-500/10 border border-red-500/20" : "bg-white/3"
                      }`}
                    >
                      <span className="text-[#ACACAC] shrink-0 w-16 text-xs">{formatTime(e.timestamp)}</span>
                      <span className="text-white flex-1">{ACTION_LABELS[e.actionType] ?? e.actionType}</span>
                      {e.diceValue && <span className="text-[#ACACAC] shrink-0">[{e.diceValue}]</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
