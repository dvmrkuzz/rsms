import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Megaphone } from 'lucide-react'
import api from '../lib/api'
import type { Announcement } from '../types'

export default function AnnouncementsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['kiosk-announcements'],
    queryFn: () => api.get('/announcements/active?target=kiosk').then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-amber-600 text-white px-8 py-6 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-amber-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-amber-100 text-sm">Latest news from the registrar</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-8 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : !data?.length ? (
          <div className="text-center py-20">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No announcements at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((a: Announcement) => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 text-lg">{a.title}</h3>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">{a.content}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(a.createdAt).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}