import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#282828]">
      <Header />
      <main className="max-w-[1172px] mx-auto px-4 pt-8">
        <Outlet />
      </main>
    </div>
  )
}
