import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, LogOut } from 'lucide-react'
import api from '../../lib/api'
import type { VisitorLog } from '../../types'

const PURPOSE_OPTIONS = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'document_request', label: 'Document Request' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'other', label: 'Other' },
]

export default function VisitorsPage() {
  const queryClient = useQueryClient()
  const [showCheckin, setShowCheckin] = useState(false)
  const [form, setForm] = useState({
    visitorName: '',
    contactNumber: '',
    studentId: '',
    purpose: 'inquiry',
    purposeDetails: '',
  })

  const { data: stats } = useQuery({
    queryKey: ['visitors-today-stats'],
    queryFn: () => api.get('/visitors/stats/today').then(r => r.data),
    refetchInterval: 30000,
  })

  const { data: visitors, isLoading } = useQuery({
    queryKey: ['visitors-list'],
    queryFn: () => api.get('/visitors?limit=20').then(r => r.data),
  })

  const checkin = useMutation({
    mutationFn: (data: any) => api.post('/visitors/checkin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors-list'] })
      queryClient.invalidateQueries({ queryKey: ['visitors-today-stats'] })
      queryClient.invalidateQueries({ queryKey: ['visitors-today'] })
      setShowCheckin(false)
      setForm({ visitorName: '', contactNumber: '', studentId: '', purpose: 'inquiry', purposeDetails: '' })
    },
  })

  const checkout = useMutation({
    mutationFn: (id: string) => api.patch(`/visitors/${id}/checkout`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors-list'] })
      queryClient.invalidateQueries({ queryKey: ['visitors-today-stats'] })
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visitor Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage campus visitors</p>
        </div>
        <button
          onClick={() => setShowCheckin(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800"
        >
          <UserPlus className="w-4 h-4" />
          Check In Visitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-gray-800">{stats?.totalToday ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Visitors Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-green-600">{stats?.currentlyInside ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Currently Inside</p>
        </div>
      </div>

      {/* Visitor Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Visitors</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Purpose</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Time In</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Time Out</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : visitors?.data?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No visitors today</td></tr>
            ) : (
              visitors?.data?.map((v: VisitorLog) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{v.visitorName}</td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{v.purpose.replace('_', ' ')}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(v.timeIn).toLocaleTimeString()}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {v.timeOut ? new Date(v.timeOut).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      v.timeOut ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                    }`}>
                      {v.timeOut ? 'Checked Out' : 'Inside'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {!v.timeOut && (
                      <button
                        onClick={() => checkout.mutate(v.id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        <LogOut className="w-3 h-3" />
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Check In Modal */}
      {showCheckin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-800 mb-5">Check In Visitor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  value={form.visitorName}
                  onChange={e => setForm({ ...form, visitorName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Visitor's full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact</label>
                  <input
                    value={form.contactNumber}
                    onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="09xx..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Student ID</label>
                  <input
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose *</label>
                <select
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PURPOSE_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Details</label>
                <input
                  value={form.purposeDetails}
                  onChange={e => setForm({ ...form, purposeDetails: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCheckin(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={() => checkin.mutate(form)}
                disabled={!form.visitorName || checkin.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {checkin.isPending ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}