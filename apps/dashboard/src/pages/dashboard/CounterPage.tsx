import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Users, Clock, Hash } from 'lucide-react'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'

interface QueueVisitor {
  id: string
  queueNumber: string
  visitorName: string
  studentId?: string
  purpose: 'document_request' | 'pick_up'
  visitorType?: 'student' | 'alumni' | 'non_student'
  trackingNumber?: string
  documentTypeName?: string | null
  timeIn: string
  isServed: boolean
}

const VISITOR_TYPE_LABELS: Record<string, string> = {
  student: 'Student',
  alumni: 'Alumni',
  non_student: 'Non-Student',
}

export default function CounterPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['visitors-queue-today'],
    queryFn: () => api.get('/visitors/queue/today').then(r => r.data),
    refetchInterval: 5000,
  })

  const markServed = useMutation({
    mutationFn: (id: string) => api.patch(`/visitors/${id}/serve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors-queue-today'] })
      queryClient.invalidateQueries({ queryKey: ['visitors-list'] })
    },
  })

  const waiting: QueueVisitor[] = (data?.queue ?? []).filter((v: QueueVisitor) => !v.isServed)
  const nowServing = waiting[0] ?? null
  const nextUp = waiting.slice(1, 6)

  const describe = (v: QueueVisitor) => {
    const parts = [VISITOR_TYPE_LABELS[v.visitorType ?? 'non_student']]
    if (v.purpose === 'document_request') {
      parts.push(v.documentTypeName ? `Document Request — ${v.documentTypeName}` : 'Document Request')
    } else {
      parts.push('Pick Up')
    }
    return parts.join(' · ')
  }

  return (
    <div className="space-y-5">

      <PageHeader
        title="Counter"
        subtitle="Serve visitors one at a time — updates automatically"
        action={
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-2xl font-black">{data?.waiting ?? 0}</p>
              <p className="text-white/70 text-xs flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Waiting</p>
            </div>
            <div>
              <p className="text-2xl font-black">{data?.served ?? 0}</p>
              <p className="text-white/70 text-xs flex items-center gap-1 justify-end"><CheckCircle className="w-3 h-3" /> Served</p>
            </div>
          </div>
        }
      />

      {/* Now Serving Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        {isLoading ? (
          <p className="text-gray-400 py-10">Loading queue...</p>
        ) : nowServing ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Now Serving</p>
            <p className="text-7xl font-black mb-3" style={{ color: '#7B1113' }}>
              {nowServing.queueNumber}
            </p>
            <p className="text-2xl font-bold text-gray-800">{nowServing.visitorName}</p>
            {nowServing.studentId && (
              <p className="text-sm text-gray-400 mt-0.5">{nowServing.studentId}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">{describe(nowServing)}</p>
            {nowServing.trackingNumber && (
              <p className="text-xs text-gray-400 font-mono mt-1">{nowServing.trackingNumber}</p>
            )}
            <button
              onClick={() => markServed.mutate(nowServing.id)}
              disabled={markServed.isPending}
              className="mt-8 inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white text-lg font-bold disabled:opacity-50 transition hover:opacity-90"
              style={{ background: '#7B1113' }}
            >
              <CheckCircle className="w-6 h-6" />
              {markServed.isPending ? 'Saving...' : 'Done — Call Next'}
            </button>
          </>
        ) : (
          <div className="py-10">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-xl font-bold text-gray-400">No one is waiting</p>
            <p className="text-sm text-gray-400 mt-1">
              New kiosk check-ins will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Next Up */}
      {nextUp.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Next Up</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {nextUp.map((v) => (
              <div key={v.id} className="px-5 py-3 flex items-center justify-between hover:bg-red-50/30 transition">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-black text-gray-700">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    {v.queueNumber}
                  </span>
                  <span className="text-sm text-gray-700">{v.visitorName}</span>
                </div>
                <span className="text-xs text-gray-400">{describe(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}