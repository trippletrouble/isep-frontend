import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { LevelSelectPage } from "@/features/level-select/LevelSelectPage";
import { LobbyPage } from "@/features/lobby/LobbyPage";
import { GamePage } from "@/features/game/GamePage";
import { GameResultsPage } from "@/features/game/GameResultsPage";
import { ErrorToast } from "@/components/shared/ErrorToast";

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <ErrorToast />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<LevelSelectPage />} />
              <Route path="/lobby/level-:level" element={<LobbyPage />} />
              <Route path="/lobby/:sessionId" element={<LobbyPage />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/results/:id" element={<GameResultsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
