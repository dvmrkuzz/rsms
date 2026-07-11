import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <div
      className="rounded-2xl p-5 text-white relative overflow-hidden flex items-center justify-between gap-4 flex-wrap"
      style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
      />
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-white/80 shrink-0" />}
        <div>
          <h1 className="text-xl font-black tracking-wide">{title}</h1>
          {subtitle && <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
