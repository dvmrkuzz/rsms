import { useQuery } from '@tanstack/react-query'
import { Megaphone, Clock } from 'lucide-react'
import api from '../lib/api'
import type { Announcement } from '../types'

const TARGET_LABELS: Record<string, string> = {
  all: 'General',
  students: 'Students',
  staff: 'Staff',
  kiosk: 'Campus',
}

const TARGET_COLORS: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700',
  students: 'bg-green-100 text-green-700',
  staff: 'bg-purple-100 text-purple-700',
  kiosk: 'bg-amber-100 text-amber-700',
}

export default function AnnouncementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-announcements-all'],
    queryFn: () => api.get('/announcements/active').then(r => r.data),
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-white/80" />
          <div>
            <h1 className="text-2xl font-black">Announcements</h1>
            <p className="text-white/70 text-sm mt-0.5">
              Registrar advisories, schedules, and updates
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : !data?.length ? (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No announcements at this time</p>
          <p className="text-gray-300 text-sm mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((a: Announcement) => (
            <div key={a.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-800">{a.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TARGET_COLORS[a.target]}`}>
                      {TARGET_LABELS[a.target]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(a.createdAt).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
                {a.expiresAt && (
                  <span className="ml-3">
                    · Expires {new Date(a.expiresAt).toLocaleDateString('en-PH', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}