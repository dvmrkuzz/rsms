interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: string
  bg?: string
  small?: boolean
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'text-gray-800',
  bg = 'bg-gray-50',
  small = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-black truncate ${accent} ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}
