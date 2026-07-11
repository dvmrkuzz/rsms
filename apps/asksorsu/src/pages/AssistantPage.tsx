import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Send, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react'
import api from '../lib/api'
import { useAssistantChat } from '../hooks/useAssistantChat'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const { messages, isSending, send, reset } = useAssistantChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: faqs = [] } = useQuery<FAQ[]>({
    queryKey: ['chat-faqs'],
    queryFn: () => api.get('/faqs').then((r) => r.data),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const handleSend = () => {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <div className="flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-white/80" />
          <div>
            <h1 className="text-2xl font-black">Registrar Assistant</h1>
            <p className="text-white/70 text-sm mt-0.5">
              Ask about requirements, fees, procedures, or your document request status
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Answers are generated from official registrar documents and FAQs. They may not always be complete —
          for important or unusual concerns, please visit the Registrar's Office directly.
        </p>
      </div>

      {/* Chat panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: '560px' }}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
          <span className="text-xs font-semibold text-gray-400">Conversation</span>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Start over
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                  style={{ background: '#7B1113' }}>
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'bg-gray-50 text-gray-700 rounded-bl-sm border border-gray-100'
                  }`}
                  style={msg.role === 'user' ? { background: '#7B1113' } : {}}
                >
                  {msg.text}
                </div>
                {msg.fallback && (
                  <p className="flex items-center gap-1 text-[11px] text-amber-600 mt-1 pl-1">
                    <AlertTriangle className="w-3 h-3" /> AI service unavailable — showing document info directly
                  </p>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                style={{ background: '#7B1113' }}>
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-bl-sm border border-gray-100 px-4 py-3 flex gap-1 items-center">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {faqs.length > 0 && (
          <div className="border-t border-gray-100 shrink-0 px-4 pt-3 pb-2">
            <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: '#7B1113' }}>
              Common Questions
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {faqs.slice(0, 8).map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => send(faq.question)}
                  disabled={isSending}
                  className="shrink-0 text-left text-xs px-3.5 py-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-colors text-gray-700 font-medium leading-snug disabled:opacity-50"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 shrink-0 p-3.5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            disabled={isSending}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-white text-sm font-semibold disabled:opacity-50 transition"
            style={{ background: '#7B1113' }}
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
