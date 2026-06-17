import { Link } from 'react-router-dom'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/button'
import { getOAuthUrl } from '@/api/auth.api'
import vector7 from '@/assets/vector7.png'

// Registrierung erfolgt über Keycloak – kein eigener username/password-Endpoint.
// Falls ein separater Registrierungs-URL existiert, hier analog zu getOAuthUrl() ergänzen.
export function RegisterPage() {
  return (
    <AuthForm>
      <div className="flex items-center gap-3 mb-8">
        <img src={vector7} alt="" className="w-6 h-6 object-contain" />
        <h2 className="font-[family-name:var(--font-heading)] text-white text-2xl tracking-wide m-0">
          REGISTRIEREN
        </h2>
      </div>
      <p className="text-[#ACACAC] text-sm text-center mb-6">
        Erstelle ein Konto über unseren sicheren Login-Dienst.
      </p>
      <Button
        onClick={() => { window.location.href = getOAuthUrl() }}
        className="w-full font-[family-name:var(--font-heading)] text-xl tracking-widest bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Konto erstellen
      </Button>
      <p className="mt-6 text-center text-sm text-[#ACACAC]">
        Bereits ein Konto?{' '}
        <Link to="/login" className="text-[#57DB8F] hover:underline font-medium">
          Anmelden
        </Link>
      </p>
    </AuthForm>
  )
}
