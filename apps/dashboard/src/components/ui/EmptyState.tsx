import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  hint?: string
}

export default function EmptyState({ icon: Icon, title, hint }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-400 font-medium">{title}</p>
      {hint && <p className="text-gray-400 text-sm mt-1">{hint}</p>}
    </div>
  )
}
