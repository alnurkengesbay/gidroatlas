import { X, Keyboard } from 'lucide-react'

const shortcuts = [
  { key: '?', description: 'Показать/скрыть горячие клавиши' },
  { key: 'Esc', description: 'Закрыть панели' },
  { key: 'P', description: 'Таблица приоритетов', expert: true },
  { key: 'A', description: 'AI Ассистент', expert: true },
]

export default function KeyboardShortcuts({ onClose }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div 
        className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Горячие клавиши</h2>
              <p className="text-xs text-slate-500">Быстрый доступ к функциям</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div 
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl ${
                shortcut.expert 
                  ? 'bg-purple-500/10 border border-purple-500/20' 
                  : 'bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm font-mono text-white min-w-[50px] text-center">
                  {shortcut.key}
                </kbd>
                <span className="text-slate-300">{shortcut.description}</span>
              </div>
              {shortcut.expert && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  Эксперт
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Функции с меткой "Эксперт" доступны только после входа
          </p>
        </div>
      </div>
    </div>
  )
}

