import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, ChevronDown } from 'lucide-react'
import api from '../../lib/api'
import type { ServiceRequest, RequestStatus } from '../../types'

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  ready: 'bg-teal-100 text-teal-700',
  released: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS: RequestStatus[] = [
  'pending', 'processing', 'ready', 'released', 'cancelled', 'rejected'
]

export default function ServiceRequestsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [newStatus, setNewStatus] = useState<RequestStatus | ''>('')
  const [remarks, setRemarks] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['service-requests', statusFilter, page],
    queryFn: () =>
      api.get('/service-requests', {
        params: {
          page,
          limit: 15,
          ...(statusFilter && { status: statusFilter }),
        },
      }).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, remarks, rejectionReason }: any) =>
      api.patch(`/service-requests/${id}/status`, { status, remarks, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests-summary'] })
      setSelectedRequest(null)
      setNewStatus('')
      setRemarks('')
      setRejectionReason('')
    },
  })

  const handleUpdateStatus = () => {
    if (!selectedRequest || !newStatus) return
    updateStatus.mutate({
      id: selectedRequest.id,
      status: newStatus,
      remarks,
      rejectionReason,
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and process student document requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tracking number..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as RequestStatus | ''); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Tracking #</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Document</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Copies</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No requests found</td></tr>
            ) : (
              data?.data
                ?.filter((r: ServiceRequest) =>
                  !search || r.trackingNumber.toLowerCase().includes(search.toLowerCase())
                )
                .map((req: ServiceRequest) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{req.trackingNumber}</td>
                    <td className="px-5 py-3 text-gray-700">{req.documentType?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {req.user ? `${req.user.firstName} ${req.user.lastName}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{req.copies}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {!['released', 'cancelled', 'rejected'].includes(req.status) && (
                        <button
                          onClick={() => { setSelectedRequest(req); setNewStatus('') }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {data.totalPages} — {data.total} total</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >Previous</button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Update Request Status</h3>
            <p className="text-sm text-gray-500 mb-5 font-mono">{selectedRequest.trackingNumber}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as RequestStatus)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status...</option>
                  {STATUS_OPTIONS.filter(s => !['pending', 'cancelled', 'released', 'rejected'].includes(s) ||
                    (selectedRequest.status === 'pending' && ['processing', 'rejected', 'cancelled'].includes(s)) ||
                    (selectedRequest.status === 'processing' && ['ready', 'rejected', 'cancelled'].includes(s)) ||
                    (selectedRequest.status === 'ready' && s === 'released')
                  ).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks (optional)</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add a note..."
                />
              </div>

              {newStatus === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Reason for rejection..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatus.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}