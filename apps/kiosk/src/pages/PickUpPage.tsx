import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Loader2, Hash } from 'lucide-react'
import api from '../lib/api'
import logo from '../assets/logo.png'

interface SuccessData {
  queueNumber: string
  trackingNumber: string | null
  visitorName: string
}

export default function PickUpPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [form, setForm] = useState({
    visitorName: '',
    studentId: '',
    contactNumber: '',
    trackingCode: '',
  })

  const handleSubmit = async () => {
    if (!form.visitorName.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/visitors/checkin', {
        visitorName: form.visitorName,
        studentId: form.studentId || undefined,
        contactNumber: form.contactNumber || undefined,
        purpose: 'pick_up',
        notes: form.trackingCode ? `Tracking: ${form.trackingCode}` : undefined,
      })
      setSuccessData(res.data)
      setTimeout(() => navigate('/'), 10000)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (successData) {
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
            <h2 className="text-4xl font-black text-white mb-2">Logged In!</h2>
            <p className="text-white/70 text-xl">Welcome, {successData.visitorName.split(' ')[0]}!</p>
          </div>

          {/* Queue Number — big and prominent */}
          <div className="bg-white rounded-3xl px-16 py-8 shadow-2xl">
            <p className="text-sm font-semibold text-gray-400 mb-1 tracking-widest uppercase">Your Queue Number</p>
            <div className="flex items-center justify-center gap-2">
              <Hash className="w-8 h-8" style={{ color: '#7B1113' }} />
              <span className="text-7xl font-black tracking-tight" style={{ color: '#7B1113' }}>
                {successData.queueNumber}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-2">Please wait for your number to be called at the window</p>
          </div>

          <p className="text-white/40 text-sm">Returning to home screen in 10 seconds...</p>
        </div>

        <div className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: '#F5F5F5' }}>

      {/* Header */}
      <div className="text-white px-8 py-5 flex items-center gap-4 shrink-0"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <button
          onClick={() => navigate('/')}
          className="p-3 rounded-xl hover:bg-white/10 transition active:scale-95"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <img src={logo} alt="SorSU" className="w-10 h-10 object-contain" />
        <div>
          <p className="font-black text-xl">Pick Up Document</p>
          <p className="text-white/70 text-sm">Enter your details to get a queue number</p>
        </div>
      </div>
      <div className="h-1 shrink-0"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-base">
              {error}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">Your Details</h2>
            <p className="text-gray-500 text-base">Please fill in your information to proceed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                Full Name *
              </label>
              <input
                value={form.visitorName}
                onChange={e => setForm({ ...form, visitorName: e.target.value })}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                placeholder="Enter your full name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                Tracking Code
              </label>
              <input
                value={form.trackingCode}
                onChange={e => setForm({ ...form, trackingCode: e.target.value.toUpperCase() })}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:border-red-800 transition"
                placeholder="RSMS-YYYYMMDD-XXXX"
              />
              <p className="text-xs text-gray-400 mt-1.5">Optional — from your original document request slip</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                  Student ID
                </label>
                <input
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#7B1113' }}>
                  Contact Number
                </label>
                <input
                  value={form.contactNumber}
                  onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-800 transition"
                  placeholder="09xx-xxx-xxxx"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.visitorName.trim() || submitting}
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
