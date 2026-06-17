import type { ReactNode } from 'react'
import logoImg from '@/assets/logo.png'

export function AuthForm({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#282828] px-4 py-12">
      <img src={logoImg} alt="LUDO 2.0" className="mb-10 w-80 select-none" />
      <div className="w-full max-w-[400px] rounded-[20px] border border-[#797979] bg-[#292929] p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)]">
        {children}
      </div>
    </div>
  )
}
