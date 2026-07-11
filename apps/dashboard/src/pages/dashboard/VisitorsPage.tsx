import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Users, CheckCircle, Clock, Hash } from 'lucide-react'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import type { VisitorLog } from '../../types'

const PURPOSE_OPTIONS = [
  { value: 'document_request', label: 'Document Request' },
  { value: 'pick_up', label: 'Pick Up' },
]

const VISITOR_TYPE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'non_student', label: 'Non-Student' },
]

const VISITOR_TYPE_STYLES: Record<string, string> = {
  student: 'bg-blue-50 text-blue-700',
  alumni: 'bg-indigo-50 text-indigo-700',
  non_student: 'bg-gray-100 text-gray-600',
}

const VISITOR_TYPE_LABELS: Record<string, string> = {
  student: 'Student',
  alumni: 'Alumni',
  non_student: 'Non-Student',
}

export default function VisitorsPage() {
  const queryClient = useQueryClient()
  const [showCheckin, setShowCheckin] = useState(false)
  const [form, setForm] = useState({
    visitorName: '',
    contactNumber: '',
    studentId: '',
    purpose: 'document_request',
    visitorType: 'student',
    notes: '',
  })

  const { data: todayQueue } = useQuery({
    queryKey: ['visitors-queue-today'],
    queryFn: () => api.get('/visitors/queue/today').then(r => r.data),
    refetchInterval: 5000,
  })

  const { data: visitors, isLoading } = useQuery({
    queryKey: ['visitors-list'],
    queryFn: () => api.get('/visitors?limit=50').then(r => r.data),
    refetchInterval: 5000,
  })

  const checkin = useMutation({
    mutationFn: (data: any) => api.post('/visitors/checkin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors-list'] })
      queryClient.invalidateQueries({ queryKey: ['visitors-queue-today'] })
      setShowCheckin(false)
      setForm({ visitorName: '', contactNumber: '', studentId: '', purpose: 'document_request', visitorType: 'student', notes: '' })
    },
  })

  const markServed = useMutation({
    mutationFn: (id: string) => api.patch(`/visitors/${id}/serve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors-list'] })
      queryClient.invalidateQueries({ queryKey: ['visitors-queue-today'] })
    },
  })

  return (
    <div className="space-y-5">

      <PageHeader
        title="Visitor Queue"
        subtitle="Today's queue — auto-refreshes every 5 seconds"
        action={
          <button
            onClick={() => setShowCheckin(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg text-sm font-semibold hover:bg-red-50 transition"
            style={{ color: '#7B1113' }}
          >
            <UserPlus className="w-4 h-4" />
            Manual Check-In
          </button>
        }
      />

      {/* Queue Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Today"
          value={todayQueue?.total ?? 0}
          icon={<Users className="w-6 h-6" style={{ color: '#7B1113' }} />}
          bg="bg-[#F9F0F0]"
        />
        <StatCard
          label="Waiting"
          value={todayQueue?.waiting ?? 0}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          accent="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label="Served"
          value={todayQueue?.served ?? 0}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          accent="text-green-600"
          bg="bg-green-50"
        />
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Visitor Log</h2>
          <span className="text-xs text-gray-400">{visitors?.total ?? 0} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr style={{ background: '#F9F0F0' }}>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Queue #</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Name</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Type</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Purpose</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Tracking #</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Time In</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : visitors?.data?.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No visitors today</td></tr>
              ) : (
                visitors?.data?.map((v: VisitorLog) => (
                  <tr key={v.id} className="hover:bg-red-50/30 transition">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-black text-gray-700">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        {v.queueNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{v.visitorName}</p>
                      {v.studentId && <p className="text-xs text-gray-400">{v.studentId}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        VISITOR_TYPE_STYLES[v.visitorType ?? 'non_student']
                      }`}>
                        {VISITOR_TYPE_LABELS[v.visitorType ?? 'non_student']}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        v.purpose === 'document_request'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {v.purpose === 'document_request' ? 'Document Request' : 'Pick Up'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {v.trackingNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(v.timeIn).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        v.isServed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {v.isServed ? 'Served' : 'Waiting'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!v.isServed && (
                        <button
                          onClick={() => markServed.mutate(v.id)}
                          disabled={markServed.isPending}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition"
                          style={{ background: '#7B1113' }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Served
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Check-In Modal */}
      {showCheckin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="h-1 w-10 rounded mb-4" style={{ background: '#7B1113' }} />
            <h3 className="font-bold text-gray-800 mb-5">Manual Check-In</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Full Name *</label>
                <input
                  value={form.visitorName}
                  onChange={e => setForm({ ...form, visitorName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Visitor's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Visitor Type *</label>
                <select
                  value={form.visitorType}
                  onChange={e => setForm({ ...form, visitorType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                >
                  {VISITOR_TYPE_OPTIONS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Contact</label>
                  <input
                    value={form.contactNumber}
                    onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="09xx..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Student ID</label>
                  <input
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Purpose *</label>
                <select
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                >
                  {PURPOSE_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Notes</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCheckin(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => checkin.mutate(form)}
                disabled={!form.visitorName || checkin.isPending}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm disabled:opacity-50"
                style={{ background: '#7B1113' }}
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