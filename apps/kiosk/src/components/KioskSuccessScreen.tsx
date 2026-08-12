import { CheckCircle, Hash } from 'lucide-react'

interface KioskSuccessScreenProps {
  title: string
  visitorFirstName: string
  queueNumber: string
  queueHint: string
  trackingNumber?: string | null
}

export default function KioskSuccessScreen({
  title, visitorFirstName, queueNumber, queueHint, trackingNumber,
}: KioskSuccessScreenProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>
      <div className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-8">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle className="w-16 h-16" style={{ color: '#7B1113' }} />
        </div>

        <div>
          <h2 className="text-4xl font-black text-white mb-2">{title}</h2>
          <p className="text-white/70 text-xl">Welcome, {visitorFirstName}!</p>
        </div>

        <div className="bg-white rounded-3xl px-16 py-8 shadow-2xl">
          <p className="text-sm font-semibold text-gray-400 mb-1 tracking-widest uppercase">Your Queue Number</p>
          <div className="flex items-center justify-center gap-2">
            <Hash className="w-8 h-8" style={{ color: '#7B1113' }} />
            <span className="text-7xl font-black tracking-tight" style={{ color: '#7B1113' }}>
              {queueNumber}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">{queueHint}</p>
        </div>

        {trackingNumber && (
          <div className="rounded-2xl px-8 py-4 border-2"
            style={{ background: 'rgba(240,208,128,0.15)', borderColor: 'rgba(240,208,128,0.5)' }}>
            <p className="text-white/60 text-sm mb-1">Tracking Number</p>
            <p className="font-black text-2xl tracking-widest font-mono" style={{ color: '#F0D080' }}>
              {trackingNumber}
            </p>
            <p className="text-white/50 text-xs mt-1">Save this to track your request status</p>
          </div>
        )}

        <p className="text-white/40 text-sm">Returning to home screen in 10 seconds...</p>
      </div>

      <div className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
    </div>
  )
}
