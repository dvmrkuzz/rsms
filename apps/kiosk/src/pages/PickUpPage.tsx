import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Printer } from 'lucide-react'
import api from '../lib/api'
import KioskStepHeader from '../components/KioskStepHeader'

interface SuccessData {
  queueNumber: string
  trackingNumber: string | null
  visitorName: string
}

export default function PickUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const firstName = searchParams.get('firstName') ?? ''
  const lastName = searchParams.get('lastName') ?? ''
  const contactNumber = searchParams.get('contactNumber') ?? ''
  const idNumber = searchParams.get('idNumber') ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [trackingCode, setTrackingCode] = useState('')

  const handleSubmit = async () => {
    if (!fullName) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/visitors/checkin', {
        visitorName: fullName,
        studentId: idNumber || undefined,
        contactNumber: contactNumber || undefined,
        purpose: 'pick_up',
        notes: trackingCode ? `Tracking: ${trackingCode}` : undefined,
      })
      setSuccessData(res.data)
      setTimeout(() => navigate('/'), 15000)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => window.print()

  if (successData) {
    const now = new Date()
    return (
      <>
        {/* Print Slip */}
        <div className="hidden print:block p-8 font-sans">
          <div style={{ borderBottom: '3px solid #7B1113', paddingBottom: '12px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 900, fontSize: '18px', color: '#7B1113' }}>
              SORSOGON STATE UNIVERSITY — BULAN CAMPUS
            </p>
            <p style={{ fontSize: '13px', color: '#666' }}>Registrar's Office — Pick Up Slip</p>
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>QUEUE NUMBER</p>
            <p style={{ fontSize: '64px', fontWeight: 900, color: '#7B1113', lineHeight: 1 }}>
              {successData.queueNumber}
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            {[
              ['Name', fullName],
              ['Contact', contactNumber],
              ['ID Number', idNumber || '—'],
              ['Tracking Code', trackingCode || '—'],
              ['Date & Time', now.toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 8px', fontWeight: 700, color: '#555', width: '35%' }}>{label}</td>
                <td style={{ padding: '6px 8px', color: '#222' }}>{value}</td>
              </tr>
            ))}
          </table>
          <div style={{ marginTop: '20px', padding: '12px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#555' }}>
              Please proceed to the <strong>Registrar window</strong> and present this slip when your queue number is called.
            </p>
          </div>
        </div>

        {/* Screen Success */}
        <div className="min-h-screen flex flex-col relative overflow-hidden print:hidden"
          style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>
          <div className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#7B1113" strokeWidth="2" />
                <path d="M6 12l4 4 8-8" stroke="#7B1113" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white mb-1">Logged In!</h2>
              <p className="text-white/70 text-xl">Welcome, {firstName}!</p>
            </div>

            <div className="bg-white rounded-3xl px-16 py-6 shadow-2xl">
              <p className="text-xs font-semibold text-gray-400 mb-1 tracking-widest uppercase">Your Queue Number</p>
              <p className="text-8xl font-black tracking-tight" style={{ color: '#7B1113' }}>
                {successData.queueNumber}
              </p>
              <p className="text-gray-500 text-sm mt-1">Please wait for your number to be called at the window</p>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl font-black text-lg shadow-lg transition active:scale-95"
              style={{ color: '#7B1113' }}
            >
              <Printer className="w-6 h-6" />
              PRINT SLIP
            </button>

            <p className="text-white/40 text-sm">Returning to home screen in 15 seconds...</p>
          </div>

          <div className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5' }}>
      <KioskStepHeader
        title="Pick Up Document"
        subtitle="Get a queue number to claim your document"
      />

      <div className="flex-1 flex items-start justify-center px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-base">
              {error}
            </div>
          )}

          {/* Requestor summary */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Picking up as</p>
            <p className="font-bold text-gray-800 text-lg">{fullName}</p>
            <p className="text-sm text-gray-500">{contactNumber}{idNumber ? ` · ID: ${idNumber}` : ''}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                Tracking Code <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </label>
              <input
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value.toUpperCase())}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:border-red-800 transition"
                placeholder="RSMS-YYYYMMDD-XXXX"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                From your original document request slip — helps staff find your document faster
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!fullName || submitting}
            className="w-full py-5 text-white rounded-2xl text-xl font-black tracking-wide disabled:opacity-50 transition active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" /> Processing...
              </span>
            ) : 'GET QUEUE NUMBER'}
          </button>
        </div>
      </div>
    </div>
  )
}