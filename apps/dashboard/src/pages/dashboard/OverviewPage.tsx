import { useQuery } from '@tanstack/react-query'
import { FileText, Users, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const { user } = useAuthStore()

  const { data: requests } = useQuery({
    queryKey: ['requests-summary'],
    queryFn: () => api.get('/service-requests?limit=100').then(r => r.data),
  })

  const { data: visitors } = useQuery({
    queryKey: ['visitors-today'],
    queryFn: () => api.get('/visitors/stats/today').then(r => r.data),
  })

  const { data: users } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => api.get('/users?limit=1').then(r => r.data),
  })

  const pending = requests?.data?.filter((r: any) => r.status === 'pending').length ?? 0
  const processing = requests?.data?.filter((r: any) => r.status === 'processing').length ?? 0
  const released = requests?.data?.filter((r: any) => r.status === 'released').length ?? 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening at the registrar today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Pending Requests"
          value={pending}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          label="Processing"
          value={processing}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Released Today"
          value={released}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="Visitors Today"
          value={visitors?.totalToday ?? 0}
          icon={<UserCheck className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          label="Currently Inside"
          value={visitors?.currentlyInside ?? 0}
          icon={<UserCheck className="w-6 h-6 text-teal-600" />}
          color="bg-teal-50"
        />
        <StatCard
          label="Total Users"
          value={users?.total ?? 0}
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-50"
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Service Requests</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {requests?.data?.slice(0, 8).map((req: any) => (
            <div key={req.id} className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {req.trackingNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {req.documentType?.name ?? 'Unknown document'}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                req.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                req.status === 'ready' ? 'bg-teal-100 text-teal-700' :
                req.status === 'released' ? 'bg-green-100 text-green-700' :
                req.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                'bg-red-100 text-red-700'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
          {(!requests?.data || requests.data.length === 0) && (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No service requests yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}