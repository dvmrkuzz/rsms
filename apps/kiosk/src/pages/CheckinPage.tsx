import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../lib/api'
import logo from '../assets/logo.png'

const PURPOSE_OPTIONS = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'document_request', label: 'Document Request' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'other', label: 'Other' },
]

export default function CheckinPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    visitorName: '',
    contactNumber: '',
    studentId: '',
    purpose: 'inquiry',
    purposeDetails: '',
  })

  const handleSubmit = async () => {
    if (!form.visitorName.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.post('/visitors/checkin', form)
      setStep('success')
      setTimeout(() => navigate('/'), 4000)
    } catch {
      setError('Check-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 40%, #7B1113 100%)' }}>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-6">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl">
            <CheckCircle className="w-16 h-16" style={{ color: '#7B1113' }} />
          </div>
          <h2 className="text-4xl font-black text-white">
            Welcome, {form.visitorName.split(' ')[0]}!
          </h2>
          <p className="text-white/80 text-xl">Your visit has been logged successfully.</p>
          <p className="text-white/60">Please proceed to the registrar's window.</p>
          <p className="text-white/40 text-sm mt-4">Returning to home screen...</p>
        </div>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: '#F5F5F5' }}>

      {/* Header */}
      <div className="text-white px-8 py-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img src={logo} alt="SorSU" className="w-10 h-10 object-contain" />
        <div>
          <p className="font-bold text-lg">Visitor Sign In</p>
          <p className="text-white/70 text-sm">Registrar's Office — Bulan Campus</p>
        </div>
      </div>

      {/* Gold line */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-lg space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#7B1113' }}>
                Full Name *
              </label>
              <input
                value={form.visitorName}
                onChange={e => setForm({ ...form, visitorName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#7B1113' } as any}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#7B1113' }}>
                  Contact Number
                </label>
                <input
                  value={form.contactNumber}
                  onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="09xx-xxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#7B1113' }}>
                  Student ID
                </label>
                <input
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#7B1113' }}>
                Purpose of Visit *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PURPOSE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, purpose: value })}
                    className="px-4 py-3 rounded-xl text-sm text-left font-medium transition"
                    style={{
                      background: form.purpose === value ? '#7B1113' : '#F5EDED',
                      color: form.purpose === value ? 'white' : '#7B1113',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#7B1113' }}>
                Additional Details
              </label>
              <input
                value={form.purposeDetails}
                onChange={e => setForm({ ...form, purposeDetails: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                placeholder="Optional"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.visitorName.trim() || loading}
            className="w-full py-4 text-white rounded-2xl text-lg font-black tracking-wide disabled:opacity-50 transition active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </div>
      </div>
    </div>
  )
}