import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DicePanel } from "./DicePanel";
import { useGameStore } from "@/stores/game.store";

// Mock the store
vi.mock("@/stores/game.store", () => ({
  useGameStore: vi.fn(),
}));

describe("DicePanel component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render DicePanel with default phase", () => {
    (useGameStore as any).mockImplementation((selector: any) =>
      selector({
        possibleMoves: [],
        selectedFigureId: null,
        figures: [],
        gameState: {
          currentPlayerId: "player1",
          activeRules: [],
          players: [{ id: "player1", color: "RED" }],
        },
      })
    );

    render(
      <DicePanel
        currentRoll={null}
        onRoll={async () => {}}
        phase="Würfeln"
        PhaseIcon={null}
      />
    );

    expect(screen.getByText("Würfeln")).toBeInTheDocument();
    expect(screen.queryByText("FLIEGE")).not.toBeInTheDocument();
  });

  it("should render FLIEGE section and subtraction badge when PLAGUE_FLY is active and player has infected figure", () => {
    // Player has infected figure with flyDebuffCount = 1 (meaning next count = 2)
    (useGameStore as any).mockImplementation((selector: any) =>
      selector({
        possibleMoves: [],
        selectedFigureId: "1",
        figures: [
          {
            id: 1,
            playerId: "player1",
            position: 10,
            status: "ACTIVE",
            hasPlagueFly: true,
            flyDebuffCount: 1,
          },
        ],
        gameState: {
          currentPlayerId: "player1",
          activeRules: ["PLAGUE_FLY"],
          players: [{ id: "player1", color: "RED" }],
        },
      })
    );

    render(
      <DicePanel
        currentRoll={null}
        onRoll={async () => {}}
        phase="Würfeln"
        PhaseIcon={null}
      />
    );

    // FLIEGE section is active
    expect(screen.getByText("FLIEGE")).toBeInTheDocument();
    
    // Subtraction badge displays -2 (debuff count 1 + 1 = 2)
    expect(screen.getByText("-2")).toBeInTheDocument();

    // Infection stage is Stufe 2/3
    expect(screen.getByText("Stufe 2/3")).toBeInTheDocument();
  });
});
