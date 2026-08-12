import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth.store'

export interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  fallback?: boolean
}

const SESSION_KEY = 'rsms_chat_session_id'

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export const ASSISTANT_GREETING =
  "Hello! I'm the Registrar Assistant. Ask me about requirements, fees, procedures, or the status of your document request."

interface InquiryRow {
  question: string
  answer: string | null
}

function inquiriesToMessages(rows: InquiryRow[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  for (const row of rows) {
    messages.push({ role: 'user', text: row.question })
    if (row.answer) messages.push({ role: 'bot', text: row.answer })
  }
  return messages
}

export function useAssistantChat() {
  const { isAuthenticated, token } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'bot', text: ASSISTANT_GREETING }])
  const [isSending, setIsSending] = useState(false)
  const sessionId = useRef(getSessionId())

  // Restore the prior conversation — the account's history when logged in,
  // or this browser's own session when a guest — so closing the tab and
  // coming back doesn't lose it. Re-runs whenever auth state changes, so
  // logging in mid-chat switches over to that account's history.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = isAuthenticated
          ? await api.get('/inquiries/mine')
          : await api.get(`/inquiries/session/${sessionId.current}`)
        if (cancelled) return
        const history = inquiriesToMessages(res.data ?? [])
        setMessages(history.length ? history : [{ role: 'bot', text: ASSISTANT_GREETING }])
      } catch {
        if (!cancelled) setMessages([{ role: 'bot', text: ASSISTANT_GREETING }])
      }
    }

    load()
    return () => { cancelled = true }
  }, [isAuthenticated, token])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }))
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
      setIsSending(true)

      try {
        const res = await api.post('/assistant/chat', {
          message: trimmed,
          sessionId: sessionId.current,
          history,
        })
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: res.data.answer, fallback: res.data.fallback },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: "Sorry, I couldn't reach the server. Please check your connection and try again.",
            fallback: true,
          },
        ])
      } finally {
        setIsSending(false)
      }
    },
    [messages, isSending],
  )

  const reset = useCallback(() => {
    setMessages([{ role: 'bot', text: ASSISTANT_GREETING }])
  }, [])

  return { messages, isSending, send, reset }
}
