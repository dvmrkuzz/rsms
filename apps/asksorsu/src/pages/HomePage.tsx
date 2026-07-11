import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { Megaphone, MessageCircle, Search, ArrowRight, Clock, Pin } from 'lucide-react'
import api from '../lib/api'
import type { Announcement } from '../types'

export default function HomePage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: () => api.get('/announcements/active').then(r => r.data),
  })

  const quickLinks = [
    { to: '/track', icon: Search, label: 'Track Request', desc: 'Check document request status', color: '#7B1113', bg: '#F9F0F0' },
    { to: '/assistant', icon: MessageCircle, label: 'Registrar Assistant', desc: 'Ask about requirements and procedures', color: '#1D6A96', bg: '#EFF6FB' },
    { to: '/announcements', icon: Megaphone, label: 'All Announcements', desc: 'View all office posts', color: '#1A6B3A', bg: '#EFF8F3' },
  ]

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const TARGET_COLORS: Record<string, string> = {
    all: 'bg-blue-100 text-blue-700',
    students: 'bg-green-100 text-green-700',
    staff: 'bg-purple-100 text-purple-700',
    kiosk: 'bg-amber-100 text-amber-700',
  }

  const TARGET_LABELS: Record<string, string> = {
    all: 'General',
    students: 'Students',
    staff: 'Staff',
    kiosk: 'Campus',
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6">

      {/* Hero Banner */}
      <div className="rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden mb-6"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute inset-0 opacity-5 flex items-center justify-end pr-8 pointer-events-none">
          <div className="w-72 h-72 rounded-full border-4 border-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <p className="text-white/60 text-sm mb-1 relative z-10">Official Portal</p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-wide relative z-10">
          Registrar's Office
        </h1>
        <p className="text-white/80 mt-1 relative z-10 text-sm sm:text-base">
          Sorsogon State University — Bulan Campus
        </p>
        <p className="text-white/60 text-sm mt-1 relative z-10">
          Announcements, the Registrar Assistant, and request tracking in one place
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickLinks.map(({ to, icon: Icon, label, desc, color, bg }) => (
          <NavLink key={to} to={to}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group flex items-center gap-4 sm:flex-col sm:items-start">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bg }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div className="flex-1 sm:flex-none">
              <p className="font-bold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition ml-auto sm:hidden" />
          </NavLink>
        ))}
      </div>

      {/* Main layout: Feed + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* FEED */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800 text-lg">Registrar Updates</h2>
            <NavLink to="/announcements"
              className="text-xs font-semibold hover:underline flex items-center gap-1"
              style={{ color: '#7B1113' }}>
              See all <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                      <div className="h-2 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !announcements?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <Megaphone className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No posts yet</p>
              <p className="text-sm text-gray-400 mt-1">Registrar announcements will appear here</p>
            </div>
          ) : (
            announcements.map((a: Announcement, index: number) => (
              <div key={a.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">

                {/* Post Header */}
                <div className="px-5 sm:px-6 pt-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}>
                        R
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Registrar's Office</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{timeAgo(a.createdAt)}</span>
                          <span className="text-gray-300">·</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${TARGET_COLORS[a.target]}`}>
                            {TARGET_LABELS[a.target]}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0"
                        style={{ background: '#F9F0F0', color: '#7B1113' }}>
                        <Pin className="w-3 h-3" />
                        Latest
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold text-gray-800 mb-1.5 text-base">{a.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.content}</p>
                  </div>

                  {a.expiresAt && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                      <Clock className="w-3 h-3" />
                      Valid until {new Date(a.expiresAt).toLocaleDateString('en-PH', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                {/* Post Footer */}
                <div className="px-5 sm:px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString('en-PH', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: '#7B1113' }}>
                    <Megaphone className="w-3 h-3" />
                    Official Post
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full xl:w-72 shrink-0 space-y-4">

          {/* Office Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-14 w-full relative"
              style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}>
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
            </div>
            <div className="px-5 pb-5 -mt-5">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-white">
                <Megaphone className="w-6 h-6" style={{ color: '#7B1113' }} />
              </div>
              <h3 className="font-bold text-gray-800 mt-2">Registrar's Office</h3>
              <p className="text-xs text-gray-500">SorSU Bulan Campus</p>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <p>📍 Bulan, Sorsogon</p>
                <p>🕐 Mon–Fri, 8:00 AM – 5:00 PM</p>
                <p>📋 Official Registrar Portal</p>
              </div>
            </div>
          </div>

          {/* Track Request */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Track Your Request
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Enter your tracking code to check the status of your document request.
            </p>
            <NavLink to="/track"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
              style={{ background: '#7B1113' }}>
              <Search className="w-4 h-4" />
              Enter Tracking Code
            </NavLink>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Available Services
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              {[
                '📄 Transcript of Records',
                '🎓 Certificate of Enrollment',
                '📋 Good Moral Certificate',
                '🏆 Certificate of Graduation',
                '📜 Diploma',
              ].map(s => (
                <li key={s} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  {s}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}