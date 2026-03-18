import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../api/personal'
import { useAuth } from '../auth/useAuth'
import { Send, Loader2, MessageSquare } from 'lucide-react'

const SUGGESTED = [
  'How is my portfolio allocated?',
  'Which goals am I most at risk of missing?',
  'Am I saving enough for retirement?',
  'What should I consider given my life events?',
]

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-navy-950 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 mt-0.5">A</div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-navy-950 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-card'
      }`}>
        {content}
      </div>
    </div>
  )
}

export default function Copilot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendMessage(text.trim(), history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Ask ARIA</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your personal finance assistant — knows your portfolio, goals, and life events.</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-navy-950 flex items-center justify-center text-white text-xl font-bold mb-4">A</div>
            <div className="text-base font-semibold text-gray-700 mb-1">Hi {user?.display_name?.split(' ')[0]}, I'm ARIA</div>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">Ask me anything about your portfolio, goals, or what moves to make next.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs text-left px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-navy-300 hover:bg-navy-50 transition-colors font-medium text-gray-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}

        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full bg-navy-950 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 mt-0.5">A</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
              <Loader2 size={14} className="text-navy-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask ARIA anything about your finances…"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-300 max-h-32"
          style={{ height: 'auto' }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="p-3 bg-navy-950 text-white rounded-2xl hover:bg-navy-800 disabled:opacity-40 transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
