import { useCallback, useRef, useState } from 'react'
import api from '../lib/api'

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

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'bot', text: ASSISTANT_GREETING }])
  const [isSending, setIsSending] = useState(false)
  const sessionId = useRef(getSessionId())

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
