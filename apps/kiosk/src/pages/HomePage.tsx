import { useNavigate } from 'react-router-dom'
import { FileText, Package } from 'lucide-react'
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
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>

      {/* Watermark seal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-end">
        <img
          src={logo} alt=""
          className="w-auto select-none"
          style={{ height: '520px', opacity: 0.08, marginRight: '-40px' }}
          draggable={false}
        />
      </div>

      {/* Gold accent bar top */}
      <div className="h-1.5 w-full relative z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Header */}
      <div className="flex items-center gap-5 px-10 py-6 relative z-10">
        <img src={logo} alt="SorSU Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
        <div>
          <p className="text-white font-extrabold text-2xl tracking-wide">
            SORSOGON STATE UNIVERSITY
          </p>
          <p className="font-bold text-lg tracking-widest" style={{ color: '#F0D080' }}>
            BULAN CAMPUS — REGISTRAR'S OFFICE
          </p>
          <div className="h-0.5 w-24 mt-1 rounded" style={{ background: '#C9A84C' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-6 relative z-10 space-y-10">

        {/* Welcome text */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-white tracking-wide drop-shadow-lg">
            HOW CAN WE HELP YOU?
          </h1>
          <p className="text-white/70 text-xl">Please select your purpose of visit</p>
        </div>

        {/* Purpose Buttons */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">

          {/* Document Request */}
          <button
            onClick={() => navigate('/document-request')}
            className="bg-white rounded-3xl p-10 text-center shadow-2xl transition-all active:scale-95 hover:scale-105 cursor-pointer"
          >
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#F5EDED' }}>
              <FileText className="w-12 h-12" style={{ color: '#7B1113' }} />
            </div>
            <p className="font-black text-2xl tracking-wide mb-2" style={{ color: '#7B1113' }}>
              DOCUMENT
            </p>
            <p className="font-black text-2xl tracking-wide mb-3" style={{ color: '#7B1113' }}>
              REQUEST
            </p>
            <p className="text-sm text-gray-500 leading-snug">
              Request TOR, COE, Diploma, Good Moral &amp; other documents
            </p>
          </button>

          {/* Pick Up */}
          <button
            onClick={() => navigate('/pickup')}
            className="rounded-3xl p-10 text-center shadow-2xl transition-all active:scale-95 hover:scale-105 cursor-pointer border-2"
            style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(240,208,128,0.6)' }}
          >
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(240,208,128,0.2)' }}>
              <Package className="w-12 h-12" style={{ color: '#F0D080' }} />
            </div>
            <p className="font-black text-2xl tracking-wide mb-2 text-white">
              PICK UP
            </p>
            <p className="font-black text-2xl tracking-wide mb-3 text-white">
              DOCUMENT
            </p>
            <p className="text-white/60 text-sm leading-snug">
              Pick up a previously requested document using your tracking code
            </p>
          </button>
        </div>
      </div>

      {/* Gold accent bar bottom */}
      <div className="h-1.5 w-full relative z-10"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Footer bar */}
      <div className="flex items-center justify-between px-8 py-3 relative z-10"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>🕐</span>
          <span>{formattedDate} | {formattedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <span>Registrar Service Management System</span>
        </div>
      </div>
    </div>
  )
}
