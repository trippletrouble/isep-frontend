import { type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/button'
import { getOAuthUrl } from '@/api/auth.api'
import vector7 from '@/assets/vector7.png'

export function LoginPage() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    window.location.href = getOAuthUrl()
  }

  return (
    <AuthForm>
      <div className="flex items-center gap-3 mb-8">
        <img src={vector7} alt="" className="w-6 h-6 object-contain" />
        <h2 className="font-[family-name:var(--font-heading)] text-white text-2xl tracking-wide m-0">
          ANMELDEN
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-[#ACACAC] text-sm text-center">
          Melde dich mit deinem Ludo-Konto an.
        </p>
        <Button
          type="submit"
          className="w-full mt-2 font-[family-name:var(--font-heading)] text-xl tracking-widest bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
        >
          Mit Konto anmelden
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#ACACAC]">
        Noch kein Konto?{' '}
        <Link to="/register" className="text-[#57DB8F] hover:underline font-medium">
          Registrieren
        </Link>
      </p>
    </AuthForm>
  )
}
