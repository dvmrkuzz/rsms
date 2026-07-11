import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, RotateCcw, Send, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { useAssistantChat } from '../hooks/useAssistantChat'
import logo from '../assets/logo.png'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, isSending, send, reset } = useAssistantChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: faqs = [] } = useQuery<FAQ[]>({
    queryKey: ['chat-faqs'],
    queryFn: () => api.get('/faqs').then((r) => r.data),
  })

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }, [messages, isOpen, isSending])

  const handleSend = () => {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  const handleQuickReply = (question: string) => {
    send(question)
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: 'min(360px, calc(100vw - 2rem))',
            height: '540px',
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#F3F4F6',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}
          >
            <img src={logo} alt="SorSU" className="w-8 h-8 rounded-full object-contain bg-white/20 p-1" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Registrar Assistant</p>
              <p className="text-white/60 text-xs">SorSU Bulan Campus</p>
            </div>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              title="Start over"
            >
              <RotateCcw className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Gold accent */}
          <div
            className="h-0.5 shrink-0"
            style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }}
          />

          {/* Disclaimer */}
          <p className="text-[11px] text-gray-500 text-center px-4 py-1.5 bg-amber-50 border-b border-amber-100 shrink-0">
            Answers are based on official registrar documents and may not always be complete.
          </p>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                    style={{ background: '#7B1113' }}>
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}
                    style={msg.role === 'user' ? { background: '#7B1113' } : {}}
                  >
                    {msg.text}
                  </div>
                  {msg.fallback && (
                    <p className="flex items-center gap-1 text-[10px] text-amber-600 mt-1 pl-1">
                      <AlertTriangle className="w-3 h-3" /> AI service unavailable — showing document info directly
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                  style={{ background: '#7B1113' }}>
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 px-4 py-3 flex gap-1 items-center">
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
            <div className="bg-white border-t border-gray-100 shrink-0 px-3 pt-2.5 pb-2">
              <p className="text-xs font-bold tracking-wider uppercase mb-1.5" style={{ color: '#7B1113' }}>
                Common Questions
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {faqs.slice(0, 6).map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleQuickReply(faq.question)}
                    disabled={isSending}
                    className="shrink-0 text-left text-xs px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-colors text-gray-700 font-medium leading-snug disabled:opacity-50"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="bg-white border-t border-gray-100 shrink-0 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              disabled={isSending}
              className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-50 transition"
              style={{ background: '#7B1113' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7B1113 0%, #A01515 100%)' }}
        title="Ask the Registrar Assistant"
      >
        {isOpen
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
        {!isOpen && (
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: '#C9A84C' }} />
        )}
      </button>
    </>
  )
}
