import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  type Point,
  CLOCKWISE_TRACK,
  GREY_TRACK,
  RED_COLORED_TILES,
  YELLOW_COLORED_TILES,
  BLUE_COLORED_TILES,
  GREEN_COLORED_TILES,
  NEST_SLOTS,
} from "./BoardPath";
import { Figure } from "./Figure";
import { X } from "lucide-react";
import { useGameStore } from "@/stores/game.store";
import { useGameActions } from "@/hooks/useGameActions";
import type { Figure as BackendFigure } from "@/api/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type FigureState = {
  id: string;
  color: string;
  position: "nest" | number | string;
  nestIndex: number;
  startTrackIndex: number;
  hasPlagueFly?: boolean;
};

const INITIAL_FIGURES: FigureState[] = [
  {
    id: "b1",
    color: "#577CDB",
    position: "nest",
    nestIndex: 12,
    startTrackIndex: 13,
  },
  {
    id: "b2",
    color: "#577CDB",
    position: "nest",
    nestIndex: 13,
    startTrackIndex: 13,
  },
  {
    id: "b3",
    color: "#577CDB",
    position: "nest",
    nestIndex: 14,
    startTrackIndex: 13,
  },
  {
    id: "b4",
    color: "#577CDB",
    position: "nest",
    nestIndex: 15,
    startTrackIndex: 13,
  },
  {
    id: "y1",
    color: "#EBE036",
    position: "nest",
    nestIndex: 8,
    startTrackIndex: 26,
  },
  {
    id: "y2",
    color: "#EBE036",
    position: "nest",
    nestIndex: 9,
    startTrackIndex: 26,
  },
  {
    id: "y3",
    color: "#EBE036",
    position: "nest",
    nestIndex: 10,
    startTrackIndex: 26,
  },
  {
    id: "y4",
    color: "#EBE036",
    position: "nest",
    nestIndex: 11,
    startTrackIndex: 26,
  },
  {
    id: "r1",
    color: "#DB5757",
    position: "nest",
    nestIndex: 0,
    startTrackIndex: 0,
  },
  {
    id: "r2",
    color: "#DB5757",
    position: "nest",
    nestIndex: 1,
    startTrackIndex: 0,
  },
  {
    id: "r3",
    color: "#DB5757",
    position: "nest",
    nestIndex: 2,
    startTrackIndex: 0,
  },
  {
    id: "r4",
    color: "#DB5757",
    position: "nest",
    nestIndex: 3,
    startTrackIndex: 0,
  },
  {
    id: "g1",
    color: "#57DB8F",
    position: "nest",
    nestIndex: 4,
    startTrackIndex: 39,
  },
  {
    id: "g2",
    color: "#57DB8F",
    position: "nest",
    nestIndex: 5,
    startTrackIndex: 39,
  },
  {
    id: "g3",
    color: "#57DB8F",
    position: "nest",
    nestIndex: 6,
    startTrackIndex: 39,
  },
  {
    id: "g4",
    color: "#57DB8F",
    position: "nest",
    nestIndex: 7,
    startTrackIndex: 39,
  },
];

const GOAL_START_FIELDS: Record<string, number> = {
  RED: 52,
  BLUE: 57,
  GREEN: 62,
  YELLOW: 67,
};
const FINAL_GOAL_POSITIONS: Record<string, number> = {
  RED: 72,
  BLUE: 73,
  YELLOW: 74,
  GREEN: 75,
};
const HEX_TO_COLOR: Record<string, string> = {
  "#DB5757": "RED",
  "#577CDB": "BLUE",
  "#EBE036": "YELLOW",
  "#57DB8F": "GREEN",
};

interface BoardProps {
  diceRoll: number;
}

export default function Board({ diceRoll }: BoardProps) {
  const { id: sessionId } = useParams<{ id: string }>();

  const storeFigures = useGameStore((state) => state.figures);
  const gameState = useGameStore((state) => state.gameState);
  const possibleMoves = useGameStore((state) => state.possibleMoves);
  const { moveFigure } = useGameActions();

  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null);
  const setSelectedFigureIdInStore = useGameStore((state) => state.setSelectedFigureId);
  useEffect(() => {
    setSelectedFigureIdInStore(selectedFigureId);
  }, [selectedFigureId, setSelectedFigureIdInStore]);

  const [activePile, setActivePile] = useState<{
    x: number;
    y: number;
    figures: FigureState[];
  } | null>(null);

  // Lokaler State, um die schrittweise Animation zu überschreiben, während sie läuft
  const [animatedPositions, setAnimatedPositions] = useState<
    Record<string, "nest" | number | string>
  >({});

  const mapBackendFigureToFrontend = (
    backendFig: BackendFigure,
  ): FigureState => {
    const id = backendFig.id;
    const player = gameState?.players?.find(
      (p) => p.id === backendFig.playerId,
    );
    const playerColor = player ? player.color : "RED";

    let color = "#DB5757";
    let startTrackIndex = 0;
    let nestBaseIndex = 0;

    switch (playerColor) {
      case "RED":
        color = "#DB5757";
        nestBaseIndex = 0;
        startTrackIndex = 0;
        break;
      case "BLUE":
        color = "#577CDB";
        nestBaseIndex = 12;
        startTrackIndex = 13;
        break;
      case "YELLOW":
        color = "#EBE036";
        nestBaseIndex = 8;
        startTrackIndex = 26;
        break;
      case "GREEN":
        color = "#57DB8F";
        nestBaseIndex = 4;
        startTrackIndex = 39;
        break;
    }

    const relativeSlot = id % 4;
    const nestIndex = nestBaseIndex + relativeSlot;

    let position: "nest" | number | string = "nest";

    if (backendFig.position === -1 || backendFig.status === "HOME") {
      position = "nest";
    } else if (backendFig.position >= 0 && backendFig.position <= 51) {
      position = backendFig.position;
    } else if (
      Object.values(FINAL_GOAL_POSITIONS).includes(backendFig.position)
    ) {
      position = "center";
    } else if (backendFig.position >= 52 && backendFig.position <= 71) {
      const goalStart = GOAL_START_FIELDS[playerColor];
      position = `goal_${backendFig.position - goalStart}`;
    }

    // Wenn für diese Figur gerade eine Animation läuft, nutzen wir die animierte Position
    if (animatedPositions[String(id)] !== undefined) {
      position = animatedPositions[String(id)];
    }

    return {
      id: String(id),
      color,
      position,
      nestIndex,
      startTrackIndex,
      hasPlagueFly: backendFig.hasPlagueFly ?? false,
    };
  };

  const figures =
    storeFigures && storeFigures.length > 0
      ? storeFigures.map(mapBackendFigureToFrontend)
      : INITIAL_FIGURES;

  const activeFigure = figures.find((f) => f.id === selectedFigureId);

  const getGoalPathCoordinates = (
    color: string,
    index: number,
  ): Point | null => {
    switch (color) {
      case "#DB5757":
        return RED_COLORED_TILES.goalPath[index] || null;
      case "#577CDB":
        return BLUE_COLORED_TILES.goalPath[index] || null;
      case "#EBE036":
        return YELLOW_COLORED_TILES.goalPath[index] || null;
      case "#57DB8F":
        return GREEN_COLORED_TILES.goalPath[index] || null;
      default:
        return null;
    }
  };

  const getCenterCoordinates = (color: string): Point => {
    switch (color) {
      case "#DB5757":
        return { x: 785.5, y: 890 };
      case "#577CDB":
        return { x: 683, y: 786.5 };
      case "#EBE036":
        return { x: 785.5, y: 683 };
      case "#57DB8F":
        return { x: 888, y: 786.5 };
      default:
        return { x: 785.5, y: 786.5 };
    }
  };

  const getFigureCoordinates = (fig: FigureState): Point | null => {
    if (fig.position === "nest") return NEST_SLOTS[fig.nestIndex];
    if (typeof fig.position === "number") return CLOCKWISE_TRACK[fig.position];
    if (typeof fig.position === "string") {
      if (fig.position === "center") return getCenterCoordinates(fig.color);
      if (fig.position.startsWith("goal_")) {
        const idx = parseInt(fig.position.split("_")[1], 10);
        return getGoalPathCoordinates(fig.color, idx);
      }
    }
    return null;
  };

  const activeMove = possibleMoves.find(
    (m) => String(m.figureId) === selectedFigureId,
  );

  const targetResult =
    activeMove && activeFigure
      ? (() => {
          const pos = activeMove.toPosition;
          const colorName = HEX_TO_COLOR[activeFigure.color] ?? "RED";
          const goalStart = GOAL_START_FIELDS[colorName];
          const finalGoalPos = FINAL_GOAL_POSITIONS[colorName];

          let position: "nest" | number | string = "nest";

          if (pos === -1) {
            position = "nest";
          } else if (pos >= 0 && pos <= 51) {
            position = pos;
          } else if (pos >= goalStart && pos < finalGoalPos) {
            position = `goal_${pos - goalStart}`;
          } else if (pos === finalGoalPos) {
            position = "center";
          }

          const tile = (() => {
            if (pos >= 0 && pos <= 51) return CLOCKWISE_TRACK[pos];
            if (pos >= goalStart && pos < finalGoalPos)
              return getGoalPathCoordinates(
                activeFigure.color,
                pos - goalStart,
              );
            if (pos === finalGoalPos)
              return getCenterCoordinates(activeFigure.color);
            return null;
          })();

          return { position, tile };
        })()
      : null;

  const targetTile = targetResult?.tile || null;

  // Berechnet die einzelnen Zwischenschritte für die hüpfende Animation basierend auf dem Backend-Ziel
  const getPathOfPositions = (
    startPos: "nest" | number | string,
    targetPos: "nest" | number | string,
    fig: FigureState,
  ): Array<"nest" | number | string> => {
    if (startPos === "nest") return [targetPos];

    const path: Array<"nest" | number | string> = [];
    const colorName = HEX_TO_COLOR[fig.color] ?? "RED";
    const goalStart = GOAL_START_FIELDS[colorName];
    const finalGoalPos = FINAL_GOAL_POSITIONS[colorName];

    // Ermittle das numerische Ziel aus dem targetResult String/Zahl-Format
    let targetNumeric = 0;
    if (typeof targetPos === "number") targetNumeric = targetPos;
    else if (targetPos === "center") targetNumeric = finalGoalPos;
    else if (targetPos.startsWith("goal_"))
      targetNumeric = goalStart + parseInt(targetPos.split("_")[1], 10);

    if (typeof startPos === "number") {
      let curr = startPos;
      // Berechne Distanz auf der Standard-Schleife
      const trackDistance = (targetNumeric - startPos + 52) % 52;

      // Falls das Ziel im Haus liegt, berechnen wir die Schritte bis zum Hauseingang
      const stepsToGoalStart = (goalStart - startPos + 52) % 52;
      const willEnterHouse = targetNumeric >= goalStart;

      const stepsOnTrack = willEnterHouse ? stepsToGoalStart : trackDistance;

      for (let i = 1; i <= stepsOnTrack; i++) {
        curr = (curr + 1) % 52;
        path.push(curr);
      }

      if (willEnterHouse) {
        const houseSteps = targetNumeric - goalStart;
        for (let i = 0; i < houseSteps; i++) {
          if (goalStart + i === finalGoalPos - 1) {
            path.push("center");
          } else {
            path.push(`goal_${i}`);
          }
        }
        if (targetNumeric === finalGoalPos && !path.includes("center")) {
          path.push("center");
        }
      }
    } else if (typeof startPos === "string" && startPos.startsWith("goal_")) {
      const startGoalIdx = parseInt(startPos.split("_")[1], 10);
      const endGoalIdx =
        targetPos === "center"
          ? 5
          : parseInt((targetPos as string).split("_")[1], 10);

      for (let idx = startGoalIdx + 1; idx <= endGoalIdx; idx++) {
        if (idx === 5 || goalStart + idx === finalGoalPos) {
          path.push("center");
        } else {
          path.push(`goal_${idx}`);
        }
      }
    }

    return path;
  };

  const handleMoveToTarget = async () => {
    if (!activeMove || !sessionId || !activeFigure || !targetResult) return;

    const targetPos = targetResult.position;
    const figureId = activeMove.figureId;
    const toPosition = activeMove.toPosition;

    // 1. Berechne Animationspfad
    const path = getPathOfPositions(
      activeFigure.position,
      targetPos,
      activeFigure,
    );

    setSelectedFigureId(null);
    setActivePile(null);

    // 2. Führe die schrittweise Animation lokal aus
    for (const pos of path) {
      setAnimatedPositions((prev) => ({ ...prev, [String(figureId)]: pos }));
      await sleep(250);
    }

    // 3. Sende Bewegung ans Backend & klicke die temporäre Animationsüberschreibung weg
    try {
      await moveFigure(sessionId, figureId, toPosition);
    } catch (err) {
      console.error("Move figure error", err);
    } finally {
      // Lösche die Animation aus dem lokalen State, damit wieder die echten Backend-Daten greifen
      setAnimatedPositions((prev) => {
        const copy = { ...prev };
        delete copy[String(figureId)];
        return copy;
      });
    }
  };

  const getOffsetAndScale = (groupSize: number, index: number) => {
    if (groupSize <= 1) return { dx: 0, dy: 0, scale: 1.0 };
    if (groupSize === 2)
      return { dx: index === 0 ? -18 : 18, dy: 0, scale: 0.75 };
    if (groupSize === 3) {
      if (index === 0) return { dx: -18, dy: 0, scale: 0.6 };
      if (index === 1) return { dx: 18, dy: 0, scale: 0.6 };
      return { dx: 0, dy: -18, scale: 0.6 };
    }
    if (groupSize === 4) {
      if (index === 0) return { dx: -18, dy: 0, scale: 0.6 };
      if (index === 1) return { dx: 18, dy: 0, scale: 0.6 };
      if (index === 2) return { dx: 0, dy: -18, scale: 0.6 };
      return { dx: 0, dy: 18, scale: 0.6 };
    }
    return { dx: 0, dy: 0, scale: 0.8 };
  };

  const getPopoverStyles = () => {
    if (!activePile) return {};
    const SVG_OFFSET_X = 55;
    const SVG_OFFSET_Y = 45;
    const isRightHalf = activePile.x > 785;
    const isBottomArea = activePile.y > 1100;
    const anchorX = isRightHalf
      ? activePile.x - SVG_OFFSET_X
      : activePile.x + SVG_OFFSET_X;
    const anchorY = isBottomArea
      ? activePile.y + SVG_OFFSET_Y
      : activePile.y - SVG_OFFSET_Y;
    return {
      left: `${(anchorX / 1571) * 100}%`,
      top: `${(anchorY / 1573) * 100}%`,
      transform: `translate(${isRightHalf ? "-100%" : "0%"}, ${isBottomArea ? "-100%" : "0%"})`,
      transition: "all 200ms ease-out",
    };
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1571 1573"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full max-h-full block select-none"
        onClick={(e) => {
          const target = e.target as SVGElement;
          if (
            target.tagName === "svg" ||
            target.tagName === "path" ||
            target.tagName === "rect" ||
            target.tagName === "g"
          ) {
            setSelectedFigureId(null);
            setActivePile(null);
          }
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M545 0C583.66 3.54343e-06 615 31.3401 615 70V545C615 583.66 583.66 615 545 615H70C31.3401 615 0 583.66 0 545V70C3.54389e-06 31.3401 31.3401 0 70 0H545ZM124.343 84.3428C102.251 84.3428 84.3428 102.251 84.3428 124.343V490.657C84.3429 512.748 102.251 530.657 124.343 530.657H490.657C512.749 530.657 530.657 512.749 530.657 490.657V124.343C530.657 102.251 512.749 84.3428 490.657 84.3428H124.343Z"
          fill="#577CDB"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1500 0C1538.66 3.54343e-06 1570 31.3401 1570 70V545C1570 583.66 1538.66 615 1500 615H1025C986.34 615 955 583.66 955 545V70C955 31.3401 986.34 0 1025 0H1500ZM1079.34 84.3428C1057.25 84.3428 1039.34 102.251 1039.34 124.343V490.657C1039.34 512.748 1057.25 530.657 1079.34 530.657H1445.66C1467.75 530.657 1485.66 512.749 1485.66 490.657V124.343C1485.66 102.251 1467.75 84.3428 1445.66 84.3428H1079.34Z"
          fill="#EBE036"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M565.5 958C593.114 958 615.5 980.386 615.5 1008V1523C615.5 1550.61 593.114 1573 565.5 1573H50.5C22.8858 1573 0.5 1550.61 0.5 1523V1008C0.5 980.386 22.8858 958 50.5 958H565.5ZM124.843 1042.34C102.751 1042.34 84.8428 1060.25 84.8428 1082.34V1448.66C84.8428 1470.75 102.751 1488.66 124.843 1488.66H491.157C513.249 1488.66 531.157 1470.75 531.157 1448.66V1082.34C531.157 1060.25 513.249 1042.34 491.157 1042.34H124.843Z"
          fill="#DB5757"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1520.5 958C1548.11 958 1570.5 980.386 1570.5 1008V1523C1570.5 1550.61 1548.11 1573 1520.5 1573H1005.5C977.886 1573 955.5 1550.61 955.5 1523V1008C955.5 980.386 977.886 958 1005.5 958H1520.5ZM1079.84 1042.34C1057.75 1042.34 1039.84 1060.25 1039.84 1082.34V1448.66C1039.84 1470.75 1057.75 1488.66 1079.84 1488.66H1446.16C1468.25 1488.66 1486.16 1470.75 1486.16 1448.66V1082.34C1486.16 1060.25 1468.25 1042.34 1446.16 1042.34H1079.84Z"
          fill="#57DB8F"
        />

        <BoardCenter />

        {GREY_TRACK.map((p, i) => (
          <rect
            key={`grey-${i}`}
            x={p.x - 45}
            y={p.y - 45}
            width="90"
            height="90"
            rx="15"
            fill="#5B5B5B"
          />
        ))}
        {BLUE_COLORED_TILES.goalPath.map((p, i) => (
          <g key={`blue-goal-${i}`}>
            <rect
              x={p.x - 45}
              y={p.y - 45}
              width="90"
              height="90"
              rx="15"
              fill="#577CDB"
            />
          </g>
        ))}
        {YELLOW_COLORED_TILES.goalPath.map((p, i) => (
          <g key={`yellow-goal-${i}`}>
            <rect
              x={p.x - 45}
              y={p.y - 45}
              width="90"
              height="90"
              rx="15"
              fill="#EBE036"
            />
          </g>
        ))}
        {RED_COLORED_TILES.goalPath.map((p, i) => (
          <g key={`red-goal-${i}`}>
            <rect
              x={p.x - 45}
              y={p.y - 45}
              width="90"
              height="90"
              rx="15"
              fill="#DB5757"
            />
          </g>
        ))}
        {GREEN_COLORED_TILES.goalPath.map((p, i) => (
          <g key={`green-goal-${i}`}>
            <rect
              x={p.x - 45}
              y={p.y - 45}
              width="90"
              height="90"
              rx="15"
              fill="#57DB8F"
            />
          </g>
        ))}
        {[
          RED_COLORED_TILES.safeZone,
          BLUE_COLORED_TILES.safeZone,
          YELLOW_COLORED_TILES.safeZone,
          GREEN_COLORED_TILES.safeZone,
        ].map((p, i) => {
          const startColors = ["#DB5757", "#577CDB", "#EBE036", "#57DB8F"];
          return (
            <g key={`safe-start-${i}`}>
              <rect
                x={p.x - 45}
                y={p.y - 45}
                width="90"
                height="90"
                rx="15"
                fill={startColors[i]}
              />
            </g>
          );
        })}
        {NEST_SLOTS.map((p, i) => (
          <rect
            key={`nest-${i}`}
            x={p.x - 66.3}
            y={p.y - 66.3}
            width="132.6"
            height="132.6"
            rx="20"
            fill="#5B5B5B"
          />
        ))}

        {Object.entries(
          figures.reduce(
            (acc, fig) => {
              const coords = getFigureCoordinates(fig);
              if (!coords) return acc;
              const key = `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
              if (!acc[key]) acc[key] = { coords, figures: [] };
              acc[key].figures.push(fig);
              return acc;
            },
            {} as Record<string, { coords: Point; figures: FigureState[] }>,
          ),
        ).map(([key, group]) => {
          const { coords, figures: groupFigs } = group;
          const N = groupFigs.length;
          const isCenter = groupFigs[0].position === "center";

          if (N === 1) {
            const fig = groupFigs[0];
            const isSelected = fig.id === selectedFigureId;
            return (
              <Figure
                key={fig.id}
                x={coords.x}
                y={coords.y}
                color={fig.color}
                isSelected={isSelected}
                onClick={
                  isCenter
                    ? undefined
                    : () => {
                        if (
                          activeFigure &&
                          targetResult &&
                          fig.position === targetResult.position
                        ) {
                          handleMoveToTarget();
                          return;
                        }
                        if (fig.position === "nest" && diceRoll !== 6) {
                          toast.error("You need a 6 to leave the nest!");
                          return;
                        }
                        setSelectedFigureId(
                          fig.id === selectedFigureId ? null : fig.id,
                        );
                        setActivePile(null);
                      }
                }
              />
            );
          } else if (N <= 4) {
            return groupFigs.map((fig, idx) => {
              const { dx, dy, scale } = getOffsetAndScale(N, idx);
              const isSelected = fig.id === selectedFigureId;
              return (
                <Figure
                  key={fig.id}
                  x={coords.x + dx}
                  y={coords.y + dy}
                  color={fig.color}
                  scale={scale}
                  isSelected={isSelected}
                  onClick={
                    isCenter
                      ? undefined
                      : () => {
                          if (
                            activeFigure &&
                            targetResult &&
                            fig.position === targetResult.position
                          ) {
                            handleMoveToTarget();
                            return;
                          }
                          setActivePile({
                            x: coords.x,
                            y: coords.y,
                            figures: groupFigs,
                          });
                        }
                  }
                />
              );
            });
          } else {
            const primaryColor = groupFigs[0].color;
            const isAnySelected = groupFigs.some(
              (f) => f.id === selectedFigureId,
            );
            return (
              <Figure
                key={`stack-${key}`}
                x={coords.x}
                y={coords.y}
                color={primaryColor}
                count={N}
                isSelected={isAnySelected}
                onClick={
                  isCenter
                    ? undefined
                    : () => {
                        if (
                          activeFigure &&
                          targetResult &&
                          groupFigs[0].position === targetResult.position
                        ) {
                          handleMoveToTarget();
                          return;
                        }
                        setActivePile({
                          x: coords.x,
                          y: coords.y,
                          figures: groupFigs,
                        });
                      }
                }
              />
            );
          }
        })}

        {targetTile && (
          <circle
            cx={targetTile.x}
            cy={targetTile.y}
            r={36}
            fill="rgba(255, 255, 255, 0.2)"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeDasharray="16 8"
            className="animate-spin"
            style={{
              cursor: "pointer",
              transformOrigin: `${targetTile.x}px ${targetTile.y}px`,
              animationDuration: "4s",
            }}
            onClick={handleMoveToTarget}
          />
        )}
      </svg>

      {activePile && (
        <div
          className="absolute bg-primary backdrop-blur border border-accent rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-2 w-48 text-white"
          style={getPopoverStyles()}
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
            <span className="font-lilita text-sm uppercase tracking-wider text-white">
              Figuren-Stapel
            </span>
            <button
              onClick={() => setActivePile(null)}
              className="text-white/40 hover:text-white transition-colors text-sm font-bold"
            >
              <X />
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
            {activePile.figures.map((fig) => {
              const colorNameMap: Record<string, string> = {
                "#577CDB": "Blau",
                "#EBE036": "Gelb",
                "#DB5757": "Rot",
                "#57DB8F": "Grün",
              };
              const label = `${colorNameMap[fig.color] || "Spieler"} ${fig.id.toUpperCase()}`;
              const isSelected = fig.id === selectedFigureId;
              return (
                <button
                  key={fig.id}
                  onClick={() => {
                    if (
                      activeFigure &&
                      targetResult &&
                      fig.position === targetResult.position
                    ) {
                      handleMoveToTarget();
                      setActivePile(null);
                      return;
                    }
                    if (fig.position === "nest" && diceRoll !== 6) {
                      toast.error("You need a 6 to leave the nest!");
                      return;
                    }
                    setSelectedFigureId(
                      fig.id === selectedFigureId ? null : fig.id,
                    );
                    setActivePile(null);
                  }}
                  className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all text-left font-afacad font-bold ${isSelected ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/85"}`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: fig.color }}
                  />
                  <span className="text-base">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function BoardCenter() {
  return (
    <g id="fe1-03-board-center-triangles">
      <path
        d="M764.812 776.889L653.441 665.637C646.798 659.002 635.5 663.738 635.5 673.159V895.662C635.5 905.083 646.798 909.82 653.441 903.184L764.812 791.932C768.961 787.788 768.961 781.034 764.812 776.889Z"
        fill="#577CDB"
      />
      <path
        d="M793.498 765.174L904.013 653.06C910.605 646.373 905.899 635 896.541 635L675.511 635C666.153 635 661.448 646.373 668.04 653.06L778.554 765.174C782.672 769.351 789.381 769.351 793.498 765.174Z"
        fill="#EBE036"
      />
      <path
        d="M778.554 806.826L668.04 918.94C661.448 925.627 666.153 937 675.512 937H896.541C905.899 937 910.605 925.627 904.013 918.94L793.498 806.826C789.381 802.649 782.672 802.649 778.554 806.826Z"
        fill="#DB5757"
      />
      <path
        d="M806.188 791.932L917.559 903.184C924.202 909.82 935.5 905.083 935.5 895.662L935.5 673.159C935.5 663.738 924.202 659.001 917.559 665.637L806.188 776.889C802.039 781.033 802.039 787.788 806.188 791.932Z"
        fill="#57DB8F"
      />
    </g>
  );
}
