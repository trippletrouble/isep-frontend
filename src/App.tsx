import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage'
import { LevelSelectPage } from '@/features/level-select/LevelSelectPage'
import { LobbyPage } from '@/features/lobby/LobbyPage'
import { GamePage } from '@/features/game/GamePage'
import { GameResultsPage } from '@/features/game/GameResultsPage'
import { ProfilePage } from '@/features/profile/ProfilePage'

function App() {
  const { checkSession, isLoading } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <span className="text-white text-xl font-afacad">Laden...</span>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<LevelSelectPage />} />
            <Route path="/lobby/:level" element={<LobbyPage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/game/:id/results" element={<GameResultsPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
