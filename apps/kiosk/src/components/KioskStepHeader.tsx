import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '../assets/logo.png'

interface KioskStepHeaderProps {
  title: string
  subtitle: string
  onBack?: () => void
  steps?: { total: number; current: number }
}

export default function KioskStepHeader({ title, subtitle, onBack, steps }: KioskStepHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      <div className="text-white px-8 py-5 flex items-center gap-4 shrink-0"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <button
          onClick={onBack ?? (() => navigate('/'))}
          className="p-3 rounded-xl hover:bg-white/10 transition active:scale-95"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <img src={logo} alt="SorSU" className="w-10 h-10 object-contain" />
        <div>
          <p className="font-black text-xl">{title}</p>
          <p className="text-white/70 text-sm">{subtitle}</p>
        </div>

        {steps && (
          <div className="ml-auto flex items-center gap-2">
            {Array.from({ length: steps.total }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < steps.current ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="h-1 shrink-0"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
    </>
  )
}
