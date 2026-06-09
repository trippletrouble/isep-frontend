import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  // Week 2: const { isAuthenticated } = useAuthStore()
  const isAuthenticated = true
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
