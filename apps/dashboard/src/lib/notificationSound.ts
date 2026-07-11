let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
  if (!Ctor) return null
  if (!sharedContext) sharedContext = new Ctor()
  return sharedContext
}

// Two-note chime, similar in spirit to a Messenger/Facebook alert — synthesized
// so the app doesn't depend on a bundled or externally-fetched audio file.
export function playNotificationSound() {
  const ctx = getContext()
  if (!ctx) return

  const play = () => {
    const now = ctx.currentTime
    const tone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration)
    }
    tone(880, 0, 0.15)
    tone(1175, 0.12, 0.28)
  }

  if (ctx.state === 'suspended') {
    ctx.resume().then(play).catch(() => {})
  } else {
    play()
  }
}
