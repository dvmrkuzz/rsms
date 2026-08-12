import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '../lib/api'
import KioskStepHeader from '../components/KioskStepHeader'
import KioskSuccessScreen from '../components/KioskSuccessScreen'

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
      <KioskSuccessScreen
        title="Logged In!"
        visitorFirstName={successData.visitorName.split(' ')[0]}
        queueNumber={successData.queueNumber}
        queueHint="Please wait for your number to be called at the window"
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5' }}>
      <KioskStepHeader
        title="Pick Up Document"
        subtitle="Enter your details to get a queue number"
      />

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
