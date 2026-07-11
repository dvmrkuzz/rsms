import { X, UserPlus, FileText } from 'lucide-react'
import { useNotificationStore } from '../../store/notifications.store'

const ICONS = { visitor: UserPlus, request: FileText }

export default function ToastStack() {
  const toasts = useNotificationStore(s => s.toasts)
  const dismiss = useNotificationStore(s => s.dismiss)

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => {
        const Icon = ICONS[t.icon]
        return (
          <div
            key={t.id}
            onClick={() => { t.onClick?.(); dismiss(t.id) }}
            className="toast-enter bg-white rounded-xl shadow-lg border border-gray-100 border-l-4 p-4 flex gap-3 items-start cursor-pointer hover:shadow-xl transition-shadow"
            style={{ borderLeftColor: '#C9A84C' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#F9F0F0' }}
            >
              <Icon className="w-4 h-4" style={{ color: '#7B1113' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{t.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{t.message}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(t.id) }}
              className="text-gray-300 hover:text-gray-500 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
