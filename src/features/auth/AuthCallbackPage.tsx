import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkSession } = useAuthStore()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      useUIStore.getState().addToast({
        type: 'error',
        title: 'Login fehlgeschlagen',
        message: decodeURIComponent(error),
      })
      navigate('/login', { replace: true })
      return
    }
    checkSession().then(() => {
      navigate('/', { replace: true })
    })
  }, [])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <span className="text-white text-xl font-afacad">Anmelden...</span>
    </div>
  )
}
