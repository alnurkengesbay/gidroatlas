import { 
  Droplets, 
  LogIn, 
  LogOut, 
  User, 
  Bot,
  Table,
  Sparkles,
  Keyboard,
  Menu,
  Filter,
  Upload
} from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Header({ onLoginClick, onShowShortcuts, onShowUpload }) {
  const { 
    user, 
    isAuthenticated, 
    logout,
    togglePriorityTable,
    toggleAssistant,
    showPriorityTable,
    showAssistant,
    toggleFilters,
    showFilters
  } = useStore()

  return (
    <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between z-50">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-cyan-500/50 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-70"></div>
          
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="font-display font-black text-lg sm:text-xl tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Gidro
            </span>
            <span className="text-white">Atlas</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2">
            <p className="text-xs text-slate-400">
              Водные ресурсы Казахстана
            </p>
            <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full font-medium">
              v1.0
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {/* Mobile filter toggle */}
        <button
          onClick={toggleFilters}
          className="sm:hidden flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white transition-all"
          title="Фильтры"
        >
          <Filter className={`w-5 h-5 ${showFilters ? 'text-cyan-400' : ''}`} />
        </button>

        {/* Shortcuts button - hidden on mobile */}
        <button
          onClick={onShowShortcuts}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/30 transition-all"
          title="Горячие клавиши"
        >
          <Keyboard className="w-4 h-4" />
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">?</kbd>
        </button>

        {/* Feature toggles - only for experts */}
        {isAuthenticated && user?.role === 'expert' && (
          <>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <button
                onClick={togglePriorityTable}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  showPriorityTable 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Таблица приоритетов (P)"
              >
                <Table className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Приоритеты</span>
              </button>
              
              <button
                onClick={toggleAssistant}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  showAssistant 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="AI Ассистент (A)"
              >
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">AI</span>
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </button>
            </div>
            
            {/* Import button */}
            <button
              onClick={onShowUpload}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              title="Импорт данных"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Импорт</span>
            </button>
            
            <div className="w-px h-8 bg-slate-700" />
          </>
        )}

        {/* Auth section */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.login}</p>
                <p className="text-xs text-emerald-400">
                  {user?.role === 'expert' ? '✓ Эксперт' : 'Гость'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all hover:scale-105 active:scale-95"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Войти</span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 overflow-hidden"></div>
          </button>
        )}
      </div>
    </header>
  )
}
