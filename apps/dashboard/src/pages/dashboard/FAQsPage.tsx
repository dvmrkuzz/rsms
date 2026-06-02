import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export default function FAQsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    question: '', answer: '', category: '', sortOrder: 0,
  })

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs-admin', search],
    queryFn: () => api.get('/faqs/admin/all', {
      params: { ...(search && { search }) }
    }).then(r => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['faqs-stats'],
    queryFn: () => api.get('/faqs/admin/stats').then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['faq-categories'],
    queryFn: () => api.get('/faqs/categories').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (data: any) => api.post('/faqs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] })
      queryClient.invalidateQueries({ queryKey: ['faqs-stats'] })
      queryClient.invalidateQueries({ queryKey: ['faq-categories'] })
      resetForm()
    },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/faqs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] })
      resetForm()
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] })
      queryClient.invalidateQueries({ queryKey: ['faqs-stats'] })
    },
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: any) => api.patch(`/faqs/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs-admin'] }),
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingFaq(null)
    setForm({ question: '', answer: '', category: '', sortOrder: 0 })
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? '',
      sortOrder: faq.sortOrder,
    })
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!form.question || !form.answer) return
    if (editingFaq) {
      update.mutate({ id: editingFaq.id, data: form })
    } else {
      create.mutate(form)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this FAQ? This cannot be undone.')) {
      remove.mutate(id)
    }
  }

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-white/80" />
          <div>
            <h1 className="text-xl font-black tracking-wide">FAQ Management</h1>
            <p className="text-white/70 text-sm mt-0.5">
              Manage frequently asked questions for students
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg text-sm font-semibold hover:bg-red-50 transition"
          style={{ color: '#7B1113' }}
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total FAQs', value: stats?.total ?? 0 },
          { label: 'Active', value: stats?.active ?? 0 },
          { label: 'Inactive', value: stats?.inactive ?? 0 },
          { label: 'Categories', value: stats?.categories ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-black text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : !faqs?.length ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <HelpCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No FAQs yet. Add your first one.</p>
          </div>
        ) : (
          faqs.map((faq: FAQ) => (
            <div key={faq.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                !faq.isActive ? 'opacity-60 border-gray-100' : 'border-gray-100'
              }`}>
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {faq.category && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50"
                        style={{ color: '#7B1113' }}>
                        {faq.category}
                      </span>
                    )}
                    {!faq.isActive && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{faq.question}</p>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive.mutate({ id: faq.id, isActive: !faq.isActive })}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
                      faq.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {faq.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => handleEdit(faq)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(faq.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    {expandedId === faq.id
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {expandedId === faq.id && (
                <div className="px-5 pb-4 border-t border-gray-50">
                  <div className="h-0.5 w-8 rounded mt-3 mb-2" style={{ background: '#7B1113' }} />
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <div className="h-1 w-10 rounded mb-4" style={{ background: '#7B1113' }} />
            <h3 className="font-bold text-gray-800 mb-5">
              {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
                  Question *
                </label>
                <textarea
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
                  Answer *
                </label>
                <textarea
                  value={form.answer}
                  onChange={e => setForm({ ...form, answer: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                  placeholder="Enter the answer..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
                    Category
                  </label>
                  <input
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    list="categories"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="e.g. Documents"
                  />
                  <datalist id="categories">
                    {categories?.map((c: string) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#7B1113' }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={resetForm}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.question || !form.answer || create.isPending || update.isPending}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm disabled:opacity-50"
                style={{ background: '#7B1113' }}
              >
                {create.isPending || update.isPending
                  ? 'Saving...'
                  : editingFaq ? 'Update FAQ' : 'Add FAQ'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}