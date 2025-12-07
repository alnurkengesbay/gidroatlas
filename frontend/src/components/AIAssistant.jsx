import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Send, 
  Bot, 
  MapPin,
  Sparkles,
  Zap,
  MessageSquare,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { analyticsAPI } from '../api'

const suggestedQueries = [
  { icon: '🔴', text: 'Критические объекты' },
  { icon: '📊', text: 'Общая статистика' },
  { icon: '🎯', text: 'Что обследовать?' },
  { icon: '📍', text: 'Объекты в Алматы' }
]

export default function AIAssistant() {
  const { toggleAssistant, setSelectedObject } = useStore()
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Привет! 👋 Я ГидроКонсультант на базе GPT-4. Спросите меня о водных ресурсах Казахстана!',
      data: null
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async (query = input) => {
    if (!query.trim()) return

    const userMessage = { type: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await analyticsAPI.askAssistant(query)
      
      const assistantMessage = {
        type: 'assistant',
        content: response.message,
        responseType: response.type,
        data: response.data
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: '😔 Произошла ошибка. Попробуйте ещё раз.',
        data: null
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleObjectClick = (obj) => {
    setSelectedObject(obj)
  }

  const renderResponseData = (message) => {
    if (!message.data) return null

    switch (message.responseType) {
      case 'objects':
      case 'search':
      case 'priority_list':
        return (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {message.data.slice(0, 5).map(obj => (
              <div
                key={obj.id}
                onClick={() => handleObjectClick(obj)}
                className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors">{obj.name}</span>
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    obj.technical_condition >= 4 ? 'bg-red-500' : 
                    obj.technical_condition >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {obj.technical_condition}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  {obj.region}
                </div>
              </div>
            ))}
            {message.data.length > 5 && (
              <p className="text-purple-400/70 text-xs text-center py-2">
                + ещё {message.data.length - 5} объектов
              </p>
            )}
          </div>
        )

      case 'stats':
        if (Array.isArray(message.data)) {
          return (
            <div className="mt-3 space-y-1.5">
              {message.data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-300 text-sm">{item.region}</span>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          )
        }
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-center border border-cyan-500/20">
              <p className="text-2xl font-black text-white">{message.data.total}</p>
              <p className="text-xs text-cyan-300">Всего</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 text-center border border-red-500/20">
              <p className="text-2xl font-black text-red-400">{message.data.critical}</p>
              <p className="text-xs text-red-300">Критических</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-center border border-green-500/20">
              <p className="text-2xl font-black text-green-400">{message.data.good}</p>
              <p className="text-xs text-green-300">Хороших</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 text-center border border-yellow-500/20">
              <p className="text-2xl font-black text-yellow-400">{message.data.moderate}</p>
              <p className="text-xs text-yellow-300">Средних</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const size = isExpanded 
    ? 'w-[500px] h-[600px]' 
    : 'w-[380px] h-[480px]'

  return (
    <div className={`fixed right-4 bottom-4 ${size} z-[9999] transition-all duration-300`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative h-full bg-gradient-to-br from-slate-900/98 via-purple-950/95 to-slate-900/98 backdrop-blur-xl border border-purple-500/30 rounded-2xl flex flex-col shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        
        {/* Header */}
        <div className="relative p-4 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-50 animate-pulse"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">ГидроКонсультант</h3>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-purple-400" />
                <p className="text-xs text-purple-300">GPT-4 Powered</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleAssistant}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`max-w-[85%] ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl rounded-br-sm shadow-lg shadow-purple-500/20'
                  : 'bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm border border-white/10'
              } p-3`}>
                {msg.type === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider">Ассистент</span>
                  </div>
                )}
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {renderResponseData(msg)}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fade-up">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400 typing-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-400 typing-dot"></div>
                  </div>
                  <span className="text-xs text-slate-400">Думаю...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="relative px-4 pb-3">
            <p className="text-xs text-slate-500 mb-2">Быстрые вопросы:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(query.text)}
                  className="group px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-white transition-all"
                >
                  <span className="mr-1">{query.icon}</span>
                  {query.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="relative p-4 border-t border-purple-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросите что угодно..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="group relative px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-30 hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
