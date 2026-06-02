import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../lib/api'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export default function FAQsPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => api.get('/faqs').then(r => r.data),
  })

  const filtered = data?.filter((faq: FAQ) =>
    !search ||
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-white/80" />
          <div>
            <h1 className="text-2xl font-black">Frequently Asked Questions</h1>
            <p className="text-white/70 text-sm mt-0.5">
              Requirements, procedures, and registrar information
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800 shadow-sm"
        />
      </div>

      {/* FAQ List */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : !filtered?.length ? (
        <div className="text-center py-16">
          <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No FAQs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq: FAQ) => (
            <div key={faq.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition"
              >
                <p className="font-semibold text-gray-800 text-sm">{faq.question}</p>
                {openId === faq.id
                  ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                }
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-5 border-t border-gray-50">
                  <div className="h-0.5 w-8 rounded mt-4 mb-3"
                    style={{ background: '#7B1113' }} />
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}