import { useState, useEffect } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import api from '../lib/api'

// Session-wide unlock flag (stays until browser tab/session ends or logout)
const UNLOCK_KEY = 'rsms_pin_unlocked'

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem(UNLOCK_KEY) === 'true')
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (unlocked) return
    api.get('/auth/has-pin')
      .then(r => setHasPin(r.data.hasPin))
      .catch(() => setHasPin(false))
  }, [unlocked])

  const unlock = () => {
    sessionStorage.setItem(UNLOCK_KEY, 'true')
    setUnlocked(true)
  }

  const handleCreate = async () => {
    setError('')
    if (!/^\d{6}$/.test(pin)) { setError('PIN must be exactly 6 digits.'); return }
    if (pin !== confirmPin) { setError('PINs do not match.'); return }
    setBusy(true)
    try {
      await api.post('/auth/set-pin', { pin })
      unlock()
    } catch {
      setError('Could not set PIN. Please try again.')
    } finally { setBusy(false) }
  }

  const handleVerify = async () => {
    setError('')
    if (!/^\d{6}$/.test(pin)) { setError('Enter your 6-digit PIN.'); return }
    setBusy(true)
    try {
      await api.post('/auth/verify-pin', { pin })
      unlock()
    } catch {
      setError('Incorrect PIN. Please try again.')
      setPin('')
    } finally { setBusy(false) }
  }

  if (unlocked) return <>{children}</>

  if (hasPin === null) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
          style={{ background: '#F9F0F0' }}>
          <Lock className="w-7 h-7" style={{ color: '#7B1113' }} />
        </div>

        {hasPin ? (
          <>
            <h2 className="font-bold text-gray-800 mb-1">Enter your PIN</h2>
            <p className="text-sm text-gray-500 mb-5">Enter your 6-digit PIN to view this page.</p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="••••••"
              className="w-full text-center text-2xl tracking-[0.5em] px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-800"
              autoFocus
            />
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            <button onClick={handleVerify} disabled={busy}
              className="w-full mt-4 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
              style={{ background: '#7B1113' }}>
              {busy ? 'Checking...' : 'Unlock'}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-bold text-gray-800 mb-1">Create your PIN</h2>
            <p className="text-sm text-gray-500 mb-5">Set a 6-digit PIN to protect your requests and chat.</p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="New 6-digit PIN"
              className="w-full text-center text-xl tracking-[0.3em] px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-800 mb-3"
              autoFocus
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Confirm PIN"
              className="w-full text-center text-xl tracking-[0.3em] px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-800"
            />
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            <button onClick={handleCreate} disabled={busy}
              className="w-full mt-4 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
              style={{ background: '#7B1113' }}>
              {busy ? 'Saving...' : 'Set PIN'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}