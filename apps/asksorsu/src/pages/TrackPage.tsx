import { useState } from 'react'
import { Search, CheckCircle, Clock, Package, XCircle, AlertCircle } from 'lucide-react'
import api from '../lib/api'

const STATUS_CONFIG: Record<string, {
  label: string
  description: string
  color: string
  bg: string
  icon: any
}> = {
  pending: {
    label: 'Pending',
    description: 'Your request has been received and is awaiting processing.',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    description: 'Your document is currently being prepared by the registrar.',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: Clock,
  },
  ready: {
    label: 'Ready for Pickup',
    description: 'Your document is ready. Please visit the Registrar\'s Office with a valid ID.',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    icon: Package,
  },
  released: {
    label: 'Completed',
    description: 'Your document has been released successfully.',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This request has been cancelled.',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    icon: XCircle,
  },
  rejected: {
    label: 'Rejected',
    description: 'This request was rejected. Please contact the Registrar\'s Office.',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: AlertCircle,
  },
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.get(`/service-requests/track/${trackingNumber.trim()}`)
      setResult(res.data)
    } catch {
      setError('Tracking number not found. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = result ? STATUS_CONFIG[result.status] : null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex items-center gap-3">
          <Search className="w-7 h-7 text-white/80" />
          <div>
            <h1 className="text-2xl font-black">Track Your Request</h1>
            <p className="text-white/70 text-sm mt-0.5">
              Enter your tracking code to check your request status
            </p>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: '#7B1113' }}>
          Tracking Code
        </label>
        <div className="flex gap-3">
          <input
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            placeholder="e.g. RSMS-20260101-0000"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-800"
          />
          <button
            onClick={handleTrack}
            disabled={loading || !trackingNumber}
            className="px-6 py-3 text-white rounded-xl font-semibold disabled:opacity-50 transition flex items-center gap-2"
            style={{ background: '#7B1113' }}
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Your tracking code was provided when you submitted your request.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && statusConfig && (
        <div className="space-y-4">

          {/* Status Banner */}
          <div className={`rounded-2xl border p-5 flex items-start gap-4 ${statusConfig.bg}`}>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <statusConfig.icon className={`w-5 h-5 ${statusConfig.color}`} />
            </div>
            <div>
              <p className={`font-bold text-lg ${statusConfig.color}`}>{statusConfig.label}</p>
              <p className="text-sm text-gray-600 mt-0.5">{statusConfig.description}</p>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="h-0.5 w-10 rounded mb-4" style={{ background: '#7B1113' }} />
            <h3 className="font-bold text-gray-800 mb-4">Request Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Tracking Number', value: result.trackingNumber, mono: true },
                { label: 'Document Type', value: result.documentType?.name },
                { label: 'Copies Requested', value: result.copies },
                { label: 'Purpose', value: result.purpose ?? '—' },
                {
                  label: 'Date Submitted',
                  value: new Date(result.requestedAt).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                },
                ...(result.completedAt ? [{
                  label: 'Date Completed',
                  value: new Date(result.completedAt).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                }] : []),
                ...(result.remarks ? [{ label: 'Remarks', value: result.remarks }] : []),
                ...(result.rejectionReason ? [{ label: 'Rejection Reason', value: result.rejectionReason }] : []),
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={`text-sm font-semibold text-gray-800 text-right max-w-48 ${mono ? 'font-mono' : ''}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ready for pickup notice */}
          {result.status === 'ready' && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
              <p className="font-semibold mb-1">📋 Ready for Pickup</p>
              <p>Please proceed to the Registrar's Office and present a valid ID to claim your document.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}