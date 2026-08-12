import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, User as UserIcon } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import logo from '../assets/logo.png'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', studentId: '',
  })

  const handleGoogle = () => {
    window.location.href = '/api/v1/auth/google'
  }

  const handleGuest = () => {
    navigate('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      const res = await api.post(path, payload)
      setAuth(res.data.user, res.data.accessToken)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 space-y-2">
          <img src={logo} alt="SorSU Logo" className="w-16 h-16 object-contain mx-auto drop-shadow-lg" />
          <h1 className="text-xl font-extrabold text-white tracking-wide">SORSOGON STATE UNIVERSITY</h1>
          <p className="font-bold tracking-widest text-xs" style={{ color: '#F0D080' }}>BULAN CAMPUS</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-lg font-bold mb-1" style={{ color: '#7B1113' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Sign in to keep your conversation history across visits.
          </p>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37 24 37c-5.3 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 40.5 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.5 36.3 43 30.7 43 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  placeholder="First name"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                />
                <input
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Last name"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>
            )}

            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@sorsu.edu.ph"
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
            />

            {mode === 'register' && (
              <input
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value })}
                placeholder="Student ID (optional)"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            )}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="font-semibold hover:underline"
              style={{ color: '#7B1113' }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <button
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 mt-5 py-2"
          >
            <UserIcon className="w-4 h-4" /> Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}
