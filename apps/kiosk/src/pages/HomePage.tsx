import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

export default function HomePage() {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = now.toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
  const formattedTime = now.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>

      {/* Watermark seal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-end">
        <img
          src={logo}
          alt=""
          className="w-auto select-none"
          style={{ height: '520px', opacity: 0.08, marginRight: '-40px' }}
          draggable={false}
        />
      </div>

      {/* Gold accent bar top */}
      <div className="h-1 w-full relative z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Header */}
      <div className="flex items-center gap-5 px-10 py-6 relative z-10">
        <img
          src={logo}
          alt="SorSU Logo"
          className="w-16 h-16 object-contain drop-shadow-lg"
        />
        <div>
          <p className="text-white font-extrabold text-2xl tracking-wide">
            SORSOGON STATE UNIVERSITY
          </p>
          <p className="font-bold text-lg tracking-widest" style={{ color: '#F0D080' }}>
            BULAN CAMPUS
          </p>
          <div className="h-0.5 w-24 mt-1 rounded" style={{ background: '#C9A84C' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-6 relative z-10 space-y-8">

        {/* Welcome text */}
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-black text-white tracking-wide drop-shadow-lg">
            WELCOME!
          </h1>
          <p className="text-white/80 text-xl">Please sign in to log your visit</p>
        </div>

        {/* Sign In card */}
        <button
          onClick={() => navigate('/checkin')}
          className="bg-white rounded-3xl p-10 w-72 text-center shadow-2xl transition-all active:scale-95 hover:scale-105 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: '#F5EDED' }}>
            <UserPlus className="w-10 h-10" style={{ color: '#7B1113' }} />
          </div>
          <p className="font-black text-xl tracking-wide" style={{ color: '#7B1113' }}>VISITOR</p>
          <p className="font-black text-xl tracking-wide mb-3" style={{ color: '#7B1113' }}>SIGN IN</p>
          <p className="text-sm text-gray-500 leading-snug">
            Log your visit to the Registrar's Office
          </p>
        </button>

        <p className="text-white/60 text-sm">
          Please sign in before proceeding to the counter
        </p>
      </div>

      {/* Touch to Start bar */}
      <div
        className="relative z-10 mx-10 mb-6 rounded-2xl py-5 flex items-center justify-center gap-4 cursor-pointer transition active:scale-95"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={() => navigate('/checkin')}
      >
        <span className="text-2xl">👆</span>
        <span className="text-white font-black text-xl tracking-widest">
          TOUCH THE SCREEN TO START
        </span>
      </div>

      {/* Gold accent bar bottom */}
      <div className="h-1 w-full relative z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Footer bar */}
      <div className="flex items-center justify-between px-8 py-3 relative z-10"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>🕐</span>
          <span>{formattedDate} | {formattedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-sm border border-white/20 rounded-full px-4 py-1.5">
          <span>🌐</span>
          <span>English</span>
        </div>
      </div>
    </div>
  )
}