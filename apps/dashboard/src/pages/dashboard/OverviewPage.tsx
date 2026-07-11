import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Users, UserCheck, Clock, CheckCircle, ArrowRight, PartyPopper } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'
import StatCard from '../../components/ui/StatCard'
import type { ServiceRequest } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  pending:            'bg-amber-100 text-amber-700',
  processing:         'bg-blue-100 text-blue-700',
  forwarded_to_main:  'bg-orange-100 text-orange-700',
  ready_for_pickup:   'bg-teal-100 text-teal-700',
  released:           'bg-green-100 text-green-700',
  cancelled:          'bg-gray-100 text-gray-500',
  rejected:           'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending:            'New',
  processing:         'Being Processed',
  forwarded_to_main:  'At Main Campus',
  ready_for_pickup:   'Ready for Pickup',
  released:           'Released',
  cancelled:          'Cancelled',
  rejected:           'Rejected',
}

export default function OverviewPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const { data: requests } = useQuery({
    queryKey: ['requests-summary'],
    queryFn: () => api.get('/service-requests?limit=100').then(r => r.data),
    refetchInterval: 5000,
  })

  const { data: visitors } = useQuery({
    queryKey: ['visitors-today'],
    queryFn: () => api.get('/visitors/stats/today').then(r => r.data),
    refetchInterval: 5000,
  })

  const { data: todayQueue } = useQuery({
    queryKey: ['visitors-queue-today'],
    queryFn: () => api.get('/visitors/queue/today').then(r => r.data),
    refetchInterval: 5000,
  })

  const { data: users } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => api.get('/users?limit=1').then(r => r.data),
    enabled: isAdmin,
  })

  const pending    = requests?.data?.filter((r: any) => r.status === 'pending').length ?? 0
  const processing = requests?.data?.filter((r: any) => r.status === 'processing').length ?? 0
  const released   = requests?.data?.filter((r: any) => r.status === 'released').length ?? 0
  const waiting     = todayQueue?.waiting ?? 0

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const needsAttention = pending > 0 || waiting > 0

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10 flex items-center justify-end pr-4">
          <div className="w-32 h-32 rounded-full border-4 border-white" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
        />
        <p className="text-white/60 text-sm mb-1">{today}</p>
        <h1 className="text-2xl font-black tracking-wide">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Here's what's happening at the Registrar's Office today.
        </p>
      </div>

      {/* Needs Your Attention */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">Needs Your Attention</h2>
        {needsAttention ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pending > 0 && (
              <button
                onClick={() => navigate('/dashboard/requests')}
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">{pending} new {pending === 1 ? 'request' : 'requests'}</p>
                    <p className="text-xs text-amber-700/80">Waiting to be processed</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
              </button>
            )}
            {waiting > 0 && (
              <button
                onClick={() => navigate('/dashboard/counter')}
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-red-100 hover:opacity-90 transition text-left"
                style={{ background: '#F9F0F0' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F0D9D9' }}>
                    <UserCheck className="w-5 h-5" style={{ color: '#7B1113' }} />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#7B1113' }}>{waiting} {waiting === 1 ? 'visitor' : 'visitors'} waiting</p>
                    <p className="text-xs" style={{ color: '#7B1113', opacity: 0.7 }}>At the counter right now</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0" style={{ color: '#7B1113' }} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
            <PartyPopper className="w-6 h-6 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">
              You're all caught up! No pending requests or visitors waiting.
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Pending Requests"
          value={pending}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          accent="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label="Processing"
          value={processing}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          accent="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="Released Today"
          value={released}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          accent="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="Visitors Today"
          value={visitors?.totalToday ?? 0}
          icon={<UserCheck className="w-6 h-6 text-purple-600" />}
          accent="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          label="Currently Inside"
          value={visitors?.currentlyInside ?? 0}
          icon={<UserCheck className="w-6 h-6 text-teal-600" />}
          accent="text-teal-600"
          bg="bg-teal-50"
        />
        {isAdmin && (
          <StatCard
            label="Total Users"
            value={users?.total ?? 0}
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            accent="text-indigo-600"
            bg="bg-indigo-50"
          />
        )}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Service Requests</h2>
          <button
            onClick={() => navigate('/dashboard/requests')}
            className="text-xs font-semibold hover:underline"
            style={{ color: '#7B1113' }}
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {requests?.data?.slice(0, 8).map((req: ServiceRequest) => (
            <div key={req.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition">
              <div>
                <p className="text-sm font-semibold text-gray-800 font-mono">
                  {req.trackingNumber}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {req.documentType?.name ?? 'Unknown document'}
                  {req.user && ` — ${req.user.firstName} ${req.user.lastName}`}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[req.status]}`}>
                {STATUS_LABELS[req.status] ?? req.status}
              </span>
            </div>
          ))}
          {(!requests?.data || requests.data.length === 0) && (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No service requests yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
