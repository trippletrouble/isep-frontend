import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getOAuthUrl } from '@/api/auth.api'
import vector7 from '@/assets/vector7.png'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

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
        <Input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="bg-[#383838] border-[#797979] text-white placeholder:text-[#ACACAC] h-12 rounded-xl"
        />
        <Input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-[#383838] border-[#797979] text-white placeholder:text-[#ACACAC] h-12 rounded-xl"
        />
        <Button
          type="submit"
          className="w-full mt-2 font-[family-name:var(--font-heading)] text-xl tracking-widest bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
        >
          Anmelden
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
