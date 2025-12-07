import { useState } from 'react'
import { X, LogIn, AlertCircle, User, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { authAPI } from '../api'

export default function LoginModal({ onClose }) {
  const { setUser } = useStore()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authAPI.login(login, password)
      setUser(data.user, data.token)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-white">
              Вход в систему
            </h2>
            <p className="text-sm text-slate-400">
              Авторизуйтесь для доступа к функциям эксперта
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Логин
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Войти
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-600/20">
            <p className="text-xs text-slate-400 mb-2">Тестовые данные для входа:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">
                  <span className="text-slate-400">Логин:</span> expert
                </p>
                <p className="text-sm text-slate-200">
                  <span className="text-slate-400">Пароль:</span> expert123
                </p>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">
                Эксперт
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

