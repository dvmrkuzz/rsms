import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'
import type { AuthResponse } from '../../types'
import logo from '../../assets/logo.png'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    try {
      const res = await api.post<AuthResponse>('/auth/login', data)
      const { accessToken, user } = res.data

      if (user.role === 'student') {
        setServerError('Access denied. This portal is for staff and admin only.')
        return
      }

      setAuth(user, accessToken)
      navigate('/dashboard')
    } catch (err: any) {
      setServerError(
        err.response?.data?.message ?? 'Login failed. Please try again.'
      )
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}
    >
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-end">
        <img
          src={logo}
          alt=""
          className="select-none"
          style={{ height: '520px', opacity: 0.06, marginRight: '-40px' }}
          draggable={false}
        />
      </div>

      {/* Gold accent top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <img
            src={logo}
            alt="SorSU Logo"
            className="w-20 h-20 object-contain mx-auto drop-shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              SORSOGON STATE UNIVERSITY
            </h1>
            <p className="font-bold tracking-widest text-sm mt-0.5" style={{ color: '#F0D080' }}>
              BULAN CAMPUS
            </p>
            <div
              className="h-0.5 w-20 mx-auto mt-2 rounded"
              style={{ background: '#C9A84C' }}
            />
          </div>
          <p className="text-white/70 text-sm">Registrar Service Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Card header accent */}
          <div
            className="h-1 w-12 rounded mb-5"
            style={{ background: 'linear-gradient(90deg, #7B1113, #A01515)' }}
          />

          <h2 className="text-xl font-bold mb-1" style={{ color: '#7B1113' }}>
            Staff Login
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to access the registrar dashboard
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@sorsu.edu.ph"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#7B1113' } as any}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition pr-10"
                  style={{ '--tw-ring-color': '#7B1113' } as any}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Sorsogon State University — Bulan Campus © {new Date().getFullYear()}
        </p>
      </div>

      {/* Gold accent bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
      />
    </div>
  )
}