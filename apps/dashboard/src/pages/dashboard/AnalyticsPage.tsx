import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { BarChart2, TrendingUp, FileText, Calendar, Sparkles, Loader2, Printer } from 'lucide-react'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import { useAuthStore } from '../../store/auth.store'

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  ready: '#8B5CF6',
  released: '#10B981',
  cancelled: '#6B7280',
  rejected: '#EF4444',
}

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [aiReport, setAiReport] = useState<string | null>(null)

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: () => api.get('/analytics').then(r => r.data),
  })

  const generateReport = useMutation({
    mutationFn: () => api.post('/analytics/generate-report').then(r => r.data),
    onSuccess: (data) => setAiReport(data.report),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Loading analytics...
      </div>
    )
  }

  const { requestStats, documentStats, visitorStats, peakDays, monthlyTrend } = analytics ?? {}

  const statusPieData = requestStats
    ? Object.entries(requestStats.byStatus)
        .filter(([, v]) => (v as number) > 0)
        .map(([name, value]) => ({ name, value: value as number }))
    : []

  const topDocument = documentStats?.[0]?.name ?? '—'
  const peakDay = peakDays?.[0]?.day ?? '—'

  const reportDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">
      {/* Print stylesheet: only the report prints */}
      <style>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute; left: 0; top: 0; width: 100%;
            color: #000; background: #fff;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <PageHeader
        title="Analytics & Reports"
        subtitle="Registrar's Office — operational statistics"
        action={
          isAdmin && (
            <button
              onClick={() => generateReport.mutate()}
              disabled={generateReport.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition"
              style={{ color: '#7B1113' }}
            >
              {generateReport.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />
              }
              {generateReport.isPending ? 'Generating...' : 'Generate AI Report'}
            </button>
          )
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 no-print">
        <StatCard
          icon={<FileText className="w-6 h-6" style={{ color: '#7B1113' }} />}
          bg="bg-[#F9F0F0]"
          value={requestStats?.total ?? 0}
          label="Total Requests"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          bg="bg-green-50"
          value={`${requestStats?.completionRate ?? 0}%`}
          label="Completion Rate"
        />
        <StatCard
          icon={<BarChart2 className="w-6 h-6 text-blue-600" />}
          bg="bg-blue-50"
          value={topDocument}
          label="Top Document"
          small
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          bg="bg-purple-50"
          value={peakDay}
          label="Busiest Day"
          small
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-5 no-print">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Requests by Document Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={documentStats?.slice(0, 6) ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Requests" fill="#7B1113" radius={[4, 4, 0, 0]} />
              <Bar dataKey="released" name="Released" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusPieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 no-print">
        <h3 className="font-bold text-gray-800 mb-4">Monthly Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyTrend ?? []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend iconSize={10} />
            <Line type="monotone" dataKey="requests" name="Requests" stroke="#7B1113" strokeWidth={2} />
            <Line type="monotone" dataKey="released" name="Released" stroke="#C9A84C" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Visitor Stats */}
      <div className="grid grid-cols-3 gap-4 no-print">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Visitors Logged</p>
          <p className="text-3xl font-black text-gray-800">{visitorStats?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Visitors Today</p>
          <p className="text-3xl font-black text-gray-800">{visitorStats?.today ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Pending Requests Rate</p>
          <p className="text-3xl font-black text-amber-600">{requestStats?.pendingRate ?? 0}%</p>
        </div>
      </div>

      {/* AI Report error */}
      {generateReport.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm no-print">
          Failed to generate report. Check that ANTHROPIC_API_KEY is set in the backend .env file.
        </div>
      )}

      {/* AI Report — printable */}
      {aiReport && (
        <div id="printable-report" className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Header banner */}
          <div
            className="px-5 py-4 flex items-center justify-between gap-3"
            style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <p className="font-bold text-white text-sm">AI-Generated Narrative Report</p>
                <p className="text-white/60 text-xs">Registrar's Office · SorSU Bulan · {reportDate}</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

          {/* Highlighted key metrics */}
          <div className="grid grid-cols-4 gap-3 px-6 pt-5">
            <div className="rounded-lg p-3 text-center" style={{ background: '#F9F0F0' }}>
              <p className="text-2xl font-black" style={{ color: '#7B1113' }}>{requestStats?.total ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Requests</p>
            </div>
            <div className="rounded-lg p-3 text-center bg-green-50">
              <p className="text-2xl font-black text-green-700">{requestStats?.completionRate ?? 0}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Completion Rate</p>
            </div>
            <div className="rounded-lg p-3 text-center bg-amber-50">
              <p className="text-2xl font-black text-amber-600">{requestStats?.byStatus?.pending ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Pending</p>
            </div>
            <div className="rounded-lg p-3 text-center bg-blue-50">
              <p className="text-2xl font-black text-blue-700">{visitorStats?.total ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Visitors Logged</p>
            </div>
          </div>

          {/* Narrative */}
          <div className="px-6 py-5">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport}
            </div>
            <p className="text-xs text-gray-400 mt-6 pt-4 border-t">
              Generated by the RSMS analytics assistant (Claude) on {reportDate}. Figures are drawn directly from the system database.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}