import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield } from 'lucide-react'
import api from '../../lib/api'

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-gray-100 text-gray-600',
  approve: 'bg-teal-100 text-teal-700',
  reject: 'bg-red-100 text-red-700',
  release: 'bg-green-100 text-green-700',
  export: 'bg-amber-100 text-amber-700',
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: () =>
      api.get('/audit', {
        params: { page, limit: 20, ...(actionFilter && { action: actionFilter }) },
      }).then(r => r.data),
  })

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-white/80" />
          <div>
            <h1 className="text-xl font-black tracking-wide">Audit Logs</h1>
            <p className="text-white/70 text-sm mt-0.5">Complete system activity trail</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-2 flex-wrap">
        {['', 'create', 'update', 'delete', 'login', 'approve', 'reject', 'release'].map(action => (
          <button
            key={action}
            onClick={() => { setActionFilter(action); setPage(1) }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition"
            style={actionFilter === action
              ? { background: '#7B1113', color: 'white' }
              : { background: '#F3F4F6', color: '#4B5563' }
            }
          >
            {action === '' ? 'All Actions' : action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr style={{ background: '#F9F0F0' }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Timestamp</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>User</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Action</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Entity</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: '#7B1113' }}>Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No audit logs found</td></tr>
            ) : (
              data?.data?.map((log: any) => (
                <tr key={log.id} className="hover:bg-red-50/30 transition">
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-gray-700 text-sm">
                    {log.user
                      ? `${log.user.firstName} ${log.user.lastName}`
                      : <span className="text-gray-400 text-xs">System</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 capitalize text-xs">
                    {log.entityName?.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {log.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {data.totalPages} — {data.total} total entries</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}