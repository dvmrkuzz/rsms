import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BellOff, Megaphone, Trash2, Pencil } from 'lucide-react'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import type { Announcement } from '../../types'

const TARGET_COLORS: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700',
  students: 'bg-green-100 text-green-700',
  staff: 'bg-purple-100 text-purple-700',
  kiosk: 'bg-amber-100 text-amber-700',
}

const emptyForm = { title: '', content: '', target: 'all', expiresAt: '', imageBase64List: [] as string[] }

export default function AnnouncementsPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageError, setImageError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements?limit=20').then(r => r.data),
  })

  const save = useMutation({
    mutationFn: (payload: any) =>
      editingId
        ? api.patch(`/announcements/${editingId}`, payload)
        : api.post('/announcements', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      closeModal()
    },
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/announcements/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageError('')
    setShowModal(true)
  }

  const openEdit = (a: Announcement) => {
    setEditingId(a.id)
    let images: string[] = []
    if (a.imageBase64List) {
      try { images = JSON.parse(a.imageBase64List) } catch { images = [] }
    } else if (a.imageBase64) {
      images = [a.imageBase64]
    }
    setForm({
      title: a.title,
      content: a.content,
      target: a.target,
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : '',
      imageBase64List: images,
    })
    setImageError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setImageError('')
    if (form.imageBase64List.length + files.length > 4) {
      setImageError('You can upload up to 4 images.')
      return
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) { setImageError('Please choose image files only.'); return }
      if (file.size > 1024 * 1024) { setImageError('Each image must be under 1MB.'); return }
    }
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setForm(f => ({ ...f, imageBase64List: [...f.imageBase64List, reader.result as string] }))
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (i: number) => {
    setForm(f => ({ ...f, imageBase64List: f.imageBase64List.filter((_, idx) => idx !== i) }))
  }

  const handleSave = () => {
    save.mutate({
      ...form,
      expiresAt: form.expiresAt || undefined,
      imageBase64List: form.imageBase64List.length ? form.imageBase64List : undefined,
      // when editing and all images removed, send empty array to clear them
      ...(editingId && form.imageBase64List.length === 0 ? { imageBase64List: [] } : {}),
    })
  }

  return (
    <div className="space-y-5">

      <PageHeader
        title="Announcements"
        subtitle="Post and manage campus announcements"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg text-sm font-semibold hover:bg-red-50 transition"
            style={{ color: '#7B1113' }}
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        }
      />

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : data?.data?.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" hint="Post one so students and staff see it here." />
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
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Posted {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {a.expiresAt && <span>Expires {new Date(a.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => openEdit(a)}
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-xs">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  {a.isActive && (
                    <button onClick={() => deactivate.mutate(a.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-amber-600 text-xs">
                      <BellOff className="w-4 h-4" /> Deactivate
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm(`Permanently delete "${a.title}"? This cannot be undone.`)) remove.mutate(a.id) }}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-600 text-xs">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="h-1 w-10 rounded mb-4" style={{ background: '#7B1113' }} />
            <h3 className="font-bold text-gray-800 mb-5">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
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

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>Images (optional, up to 4)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-800 hover:file:bg-red-100" />
                {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}
                {form.imageBase64List.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {form.imageBase64List.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt={`Preview ${i + 1}`} className="h-24 rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-white/90 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-red-700 shadow">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Max 4 images, each under 1MB. Hold Ctrl to select multiple.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave}
                disabled={!form.title || !form.content || save.isPending}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm disabled:opacity-50"
                style={{ background: '#7B1113' }}>
                {save.isPending ? 'Saving...' : editingId ? 'Save Changes' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}