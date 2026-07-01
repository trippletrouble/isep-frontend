import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { LevelSelectPage } from "@/features/level-select/LevelSelectPage";
import { LobbyPage } from "@/features/lobby/LobbyPage";
import { GamePage } from "@/features/game/GamePage";
import { GameResultsPage } from "@/features/game/GameResultsPage";
import { QuizDuelView } from "@/features/quiz-duel/QuizDuelView";
import { useGameStore } from "@/stores/game.store";
import { useAuthStore } from "@/stores/auth.store";

function App() {
  const activeQuiz = useGameStore((state) => state.activeQuiz);
  const user = useAuthStore((state) => state.user);
  const submitQuizAnswer = useGameStore((state) => state.submitQuizAnswer);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<LevelSelectPage />} />
              <Route path="/lobby/:level" element={<LobbyPage />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/results/:id" element={<GameResultsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {activeQuiz && (
          <QuizDuelView
            activeQuiz={activeQuiz}
            currentUserId={user?.id || ""}
            onSubmitAnswer={submitQuizAnswer}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
