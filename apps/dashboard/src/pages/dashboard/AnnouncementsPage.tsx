import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BellOff, Megaphone } from 'lucide-react'
import api from '../../lib/api'
import type { Announcement } from '../../types'

const TARGET_COLORS: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700',
  students: 'bg-green-100 text-green-700',
  staff: 'bg-purple-100 text-purple-700',
  kiosk: 'bg-amber-100 text-amber-700',
}

export default function AnnouncementsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', target: 'all', expiresAt: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements?limit=20').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (data: any) => api.post('/announcements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setShowCreate(false)
      setForm({ title: '', content: '', target: 'all', expiresAt: '' })
    },
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/announcements/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div>
          <h1 className="text-xl font-black tracking-wide">Announcements</h1>
          <p className="text-white/70 text-sm mt-0.5">Post and manage campus announcements</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg text-sm font-semibold hover:bg-red-50 transition"
          style={{ color: '#7B1113' }}
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No announcements yet</p>
          </div>
        ) : (
          data?.data?.map((a: Announcement) => (
            <div key={a.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition ${!a.isActive ? 'opacity-60' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800">{a.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TARGET_COLORS[a.target]}`}>
                      {a.target}
                    </span>
                    {!a.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Posted {new Date(a.createdAt).toLocaleDateString()}</span>
                    {a.expiresAt && <span>Expires {new Date(a.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                {a.isActive && (
                  <button onClick={() => deactivate.mutate(a.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs shrink-0">
                    <BellOff className="w-4 h-4" /> Deactivate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="h-1 w-10 rounded mb-4" style={{ background: '#7B1113' }} />
            <h3 className="font-bold text-gray-800 mb-5">New Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Content</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                  placeholder="Announcement content..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Target Audience</label>
                  <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800">
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="staff">Staff</option>
                    <option value="kiosk">Kiosk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Expires At (optional)</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => create.mutate(form)}
                disabled={!form.title || !form.content || create.isPending}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm disabled:opacity-50"
                style={{ background: '#7B1113' }}>
                {create.isPending ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}