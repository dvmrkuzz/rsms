import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, CheckCircle, Clock, Package, XCircle } from 'lucide-react'
import api from '../lib/api'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: 'Pending',    color: 'text-amber-600 bg-amber-50',  icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-600 bg-blue-50',    icon: Clock },
  ready:      { label: 'Ready for Pickup', color: 'text-teal-600 bg-teal-50', icon: Package },
  released:   { label: 'Released',   color: 'text-green-600 bg-green-50',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-gray-600 bg-gray-50',    icon: XCircle },
  rejected:   { label: 'Rejected',   color: 'text-red-600 bg-red-50',      icon: XCircle },
}

export default function TrackPage() {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-blue-800 text-white px-8 py-6 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-blue-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Track Your Request</h1>
          <p className="text-blue-200 text-sm">Enter your tracking number below</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-lg space-y-6">

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tracking Number
            </label>
            <div className="flex gap-3">
              <input
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="RSMS-20260101-0000"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button
                onClick={handleTrack}
                disabled={loading || !trackingNumber}
                className="px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 transition"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && statusConfig && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color}`}>
                <statusConfig.icon className="w-4 h-4" />
                {statusConfig.label}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Tracking Number</span>
                  <span className="text-sm font-mono font-medium">{result.trackingNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Document</span>
                  <span className="text-sm font-medium">{result.documentType?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Copies</span>
                  <span className="text-sm font-medium">{result.copies}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Date Submitted</span>
                  <span className="text-sm font-medium">
                    {new Date(result.requestedAt).toLocaleDateString()}
                  </span>
                </div>
                {result.remarks && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Remarks</span>
                    <span className="text-sm font-medium text-right max-w-48">{result.remarks}</span>
                  </div>
                )}
              </div>

              {result.status === 'ready' && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
                  Your document is ready for pickup. Please proceed to the Registrar's Office with your valid ID.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}