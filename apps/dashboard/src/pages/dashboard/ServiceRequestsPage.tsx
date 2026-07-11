import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Cog, Send, PackageCheck, CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import type { ServiceRequest, RequestStatus } from '../../types'

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  forwarded_to_main: 'bg-orange-100 text-orange-700',
  ready_for_pickup: 'bg-teal-100 text-teal-700',
  released: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'New',
  processing: 'Being Processed',
  forwarded_to_main: 'At Main Campus',
  ready_for_pickup: 'Ready for Pickup',
  released: 'Released',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

const STATUS_OPTIONS: RequestStatus[] = [
  'pending', 'processing', 'forwarded_to_main', 'ready_for_pickup', 'released', 'cancelled', 'rejected'
]

const NEXT_ACTIONS: Partial<Record<RequestStatus, { to: RequestStatus; label: string; icon: any }[]>> = {
  pending: [
    { to: 'processing', label: 'Process Here', icon: Cog },
    { to: 'forwarded_to_main', label: 'Send to Main Campus', icon: Send },
  ],
  processing: [
    { to: 'ready_for_pickup', label: 'Ready for Pickup', icon: PackageCheck },
    { to: 'forwarded_to_main', label: 'Send to Main Campus', icon: Send },
  ],
  forwarded_to_main: [
    { to: 'ready_for_pickup', label: 'Arrived — Ready', icon: PackageCheck },
  ],
  ready_for_pickup: [
    { to: 'released', label: 'Mark Released', icon: CheckCircle },
  ],
}

const CAN_REJECT: RequestStatus[] = ['pending', 'processing', 'forwarded_to_main']

export default function ServiceRequestsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<ServiceRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['service-requests', statusFilter, page],
    queryFn: () =>
      api.get('/service-requests', {
        params: { page, limit: 15, ...(statusFilter && { status: statusFilter }) },
      }).then(r => r.data),
    refetchInterval: 15000,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: RequestStatus; rejectionReason?: string }) =>
      api.patch(`/service-requests/${id}/status`, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests-summary'] })
      setRejectTarget(null)
      setRejectionReason('')
    },
  })

  return (
    <div className="space-y-5">

      <PageHeader
        icon={FileText}
        title="Service Requests"
        subtitle="Click a button in the Next Step column to move a request forward — it updates right away."
      />

      {/* Workflow guide */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-2 flex-wrap text-xs text-gray-500">
        <span className="font-semibold text-gray-600">How it flows:</span>
        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">New</span>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">Being Processed</span>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">Ready for Pickup</span>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Released</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tracking number..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setStatusFilter(''); setPage(1) }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition"
            style={statusFilter === ''
              ? { background: '#7B1113', color: 'white' }
              : { background: '#F3F4F6', color: '#4B5563' }
            }
          >
            All Statuses
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition"
              style={statusFilter === s
                ? { background: '#7B1113', color: 'white' }
                : { background: '#F3F4F6', color: '#4B5563' }
              }
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr style={{ background: '#F9F0F0' }}>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Tracking #</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Document</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Student</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Status</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No requests found</td></tr>
              ) : (
                data?.data
                  ?.filter((r: ServiceRequest) =>
                    !search || r.trackingNumber.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((req: ServiceRequest) => (
                    <tr key={req.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs text-gray-700">{req.trackingNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.copies} {req.copies === 1 ? 'copy' : 'copies'} · {new Date(req.requestedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{req.documentType?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {req.user ? `${req.user.firstName} ${req.user.lastName}` : (
                          <span className="text-xs text-gray-400 italic">Walk-in (Kiosk)</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[req.status]}`}>
                          {STATUS_LABELS[req.status]}
                        </span>
                        {req.status === 'rejected' && req.rejectionReason && (
                          <p className="text-xs text-gray-400 mt-1 max-w-48 truncate" title={req.rejectionReason}>
                            {req.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(NEXT_ACTIONS[req.status] ?? []).map(({ to, label, icon: Icon }) => (
                            <button
                              key={to}
                              onClick={() => updateStatus.mutate({ id: req.id, status: to })}
                              disabled={updateStatus.isPending}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition hover:opacity-90 whitespace-nowrap"
                              style={{ background: '#7B1113' }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          ))}
                          {CAN_REJECT.includes(req.status) && (
                            <button
                              onClick={() => setRejectTarget(req)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {data.totalPages} — {data.total} total</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="h-1 w-10 rounded mb-4" style={{ background: '#7B1113' }} />
            <h3 className="font-bold text-gray-800 mb-1">Reject Request</h3>
            <p className="text-sm text-gray-500 mb-4 font-mono">{rejectTarget.trackingNumber}</p>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
              Why is this request being rejected? *
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
              placeholder="e.g. Incomplete requirements, unpaid fees..."
            />
            <p className="text-xs text-gray-400 mt-1.5">The student will see this reason when tracking their request.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setRejectTarget(null); setRejectionReason('') }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => updateStatus.mutate({ id: rejectTarget.id, status: 'rejected', rejectionReason })}
                disabled={!rejectionReason.trim() || updateStatus.isPending}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm disabled:opacity-50"
                style={{ background: '#7B1113' }}
              >
                {updateStatus.isPending ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
