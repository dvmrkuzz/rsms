import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, FileText, Inbox } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth.store'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  forwarded_to_main: 'bg-orange-100 text-orange-700',
  ready_for_pickup: 'bg-teal-100 text-teal-700',
  released: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'New',
  processing: 'Being Processed',
  forwarded_to_main: 'At Main Campus',
  ready_for_pickup: 'Ready for Pickup',
  released: 'Released',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

interface Request {
  id: string
  trackingNumber: string
  status: string
  copies: number
  requestedAt: string
  rejectionReason?: string | null
  documentType?: { name: string } | null
}

export default function MyRequestsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    api.get('/service-requests/my-requests', { params: { limit: 50 } })
      .then(r => setRequests(r.data.data ?? []))
      .catch(() => setError('Could not load your requests. Please try again.'))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: '#7B1113' }}>My Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Requests linked to {user?.email}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin mr-3" /> Loading your requests...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-700">No requests yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Requests you make at the kiosk using this email will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F9F0F0' }}>
                    <FileText className="w-5 h-5" style={{ color: '#7B1113' }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{req.documentType?.name ?? 'Document Request'}</p>
                    <p className="font-mono text-xs text-gray-500 mt-0.5">{req.trackingNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {req.copies} {req.copies === 1 ? 'copy' : 'copies'} · {new Date(req.requestedAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[req.status] ?? req.status}
                </span>
              </div>
              {req.status === 'rejected' && req.rejectionReason && (
                <p className="text-xs text-red-600 mt-3 pl-13">
                  Reason: {req.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}