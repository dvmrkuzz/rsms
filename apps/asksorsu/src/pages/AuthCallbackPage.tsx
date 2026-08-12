import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth.store'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login')
      return
    }

    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setAuth(res.data, token)
        navigate('/')
      })
      .catch(() => navigate('/login'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
      <div className="text-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
        <p className="text-sm text-white/80">Signing you in...</p>
      </div>
    </div>
  )
}
