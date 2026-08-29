import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'

// ── EDIT THIS when you have new changes to announce ──
// 1. Bump the VERSION (any new string) so the modal shows again to everyone.
// 2. Update the CHANGES list with what's new.
const VERSION = '2026-08-25-a'
const CHANGES = [
  'New: Status updates now use a single dropdown for faster processing.',
  'Improved: Analytics report now highlights key metrics and can be printed/saved as PDF.',
  'New: Public portal is now installable as a mobile app (Add to Home Screen).',
]
// ─────────────────────────────────────────────────────

const STORAGE_KEY = 'rsms_whatsnew_seen'

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (seen !== VERSION) {
        setOpen(true)
      }
    } catch {
      // localStorage unavailable — just show it
      setOpen(true)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, VERSION)
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">What's New</h2>
          </div>
          <button onClick={dismiss} className="p-1 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 mb-4">
            Recent updates to the RSMS dashboard:
          </p>
          <ul className="space-y-3">
            {CHANGES.map((change, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#7B1113' }}
                />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition active:scale-95"
            style={{ background: '#7B1113' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}