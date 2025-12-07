import { 
  X, 
  MapPin, 
  Calendar, 
  Droplet, 
  Fish, 
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react'

const conditionLabels = {
  1: { text: 'Отличное', color: 'bg-green-500', textColor: 'text-green-400' },
  2: { text: 'Хорошее', color: 'bg-lime-500', textColor: 'text-lime-400' },
  3: { text: 'Удовлетворительное', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  4: { text: 'Требует внимания', color: 'bg-orange-500', textColor: 'text-orange-400' },
  5: { text: 'Критическое', color: 'bg-red-500', textColor: 'text-red-400' }
}

const typeIcons = {
  'озеро': '🏞️',
  'канал': '🌊',
  'водохранилище': '💧',
  'шлюз': '🚢',
  'гидроузел': '⚙️',
  'плотина': '🏗️'
}

const priorityLabels = {
  high: { text: 'Высокий', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { text: 'Средний', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { text: 'Низкий', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
}

export default function ObjectCard({ object, onClose }) {
  const condition = conditionLabels[object.technical_condition]
  const priority = priorityLabels[object.priority?.level]
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div 
      className="fixed right-4 w-[380px] z-[9999] pointer-events-auto"
      style={{ top: '80px', maxHeight: 'calc(100vh - 100px)' }}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-cyan-500/20" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20 shrink-0 bg-slate-900">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{typeIcons[object.resource_type]}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300">
                  {object.resource_type}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white truncate">
                {object.name}
              </h2>
              <p className="text-slate-400 flex items-center gap-1 mt-1 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{object.region}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Condition & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className={`w-4 h-4 ${condition.textColor}`} />
                <span className="text-xs text-slate-400">Состояние</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg ${condition.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {object.technical_condition}
                </div>
                <span className={`text-sm font-medium ${condition.textColor}`}>
                  {condition.text}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">Приоритет</span>
              </div>
              <div className={`px-3 py-2 rounded-lg border text-center ${priority?.color || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                <span className="text-sm font-medium">
                  {priority?.text || 'Не определён'}
                </span>
                <span className="text-xs opacity-70 ml-1">
                  ({object.priority?.score || 0})
                </span>
              </div>
            </div>
          </div>

          {/* Prediction - Факторная модель */}
          {object.prediction && (
            <div className={`p-3 rounded-xl ${
              object.prediction.critical 
                ? 'bg-red-500/10 border border-red-500/30' 
                : 'bg-gradient-to-br from-slate-800/50 to-purple-900/20 border border-purple-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${object.prediction.critical ? 'text-red-400' : 'text-purple-400'}`} />
                  <span className="text-xs text-slate-400">Предиктивный анализ</span>
                </div>
                {object.prediction.confidence && !object.prediction.critical && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      object.prediction.confidence === 'высокая' ? 'bg-green-500' :
                      object.prediction.confidence === 'средняя' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-slate-500">
                      {object.prediction.confidencePercent}% уверенность
                    </span>
                  </div>
                )}
              </div>
              
              {object.prediction.critical ? (
                <p className="text-red-400 text-sm font-medium">
                  ⚠️ {object.prediction.message}
                </p>
              ) : (
                <>
                  <p className="text-slate-300 text-sm mb-2">
                    Критическое состояние через{' '}
                    <span className="font-bold text-purple-400">
                      ~{object.prediction.monthsRemaining} мес.
                    </span>
                  </p>
                  
                  {/* Факторы риска */}
                  {object.prediction.factors && object.prediction.factors.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-slate-500">Факторы риска:</span>
                      <ul className="mt-1 space-y-0.5">
                        {object.prediction.factors.map((factor, i) => (
                          <li key={i} className="text-xs text-orange-400/80 flex items-center gap-1">
                            <span>•</span> {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Модель (для экспертов) */}
                  {object.prediction.model && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <details className="group">
                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                          Параметры модели ▼
                        </summary>
                        <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                          <span className="text-slate-500">Базовая деградация:</span>
                          <span className="text-slate-300">{object.prediction.model.baseDegradation}/год</span>
                          <span className="text-slate-500">Фактор среды:</span>
                          <span className="text-slate-300">×{object.prediction.model.waterFactor}</span>
                          <span className="text-slate-500">Фактор фауны:</span>
                          <span className="text-slate-300">×{object.prediction.model.faunaFactor}</span>
                          <span className="text-slate-500">Итоговая скорость:</span>
                          <span className="text-purple-400 font-medium">{object.prediction.model.effectiveDegradation}/год</span>
                        </div>
                      </details>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
              <span className="text-slate-400 flex items-center gap-2 text-sm">
                <Droplet className="w-4 h-4" />
                Тип воды
              </span>
              <span className="text-white font-medium text-sm">
                {object.water_type || 'Не указан'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
              <span className="text-slate-400 flex items-center gap-2 text-sm">
                <Fish className="w-4 h-4" />
                Фауна
              </span>
              <span className={`font-medium text-sm ${object.fauna ? 'text-green-400' : 'text-slate-400'}`}>
                {object.fauna ? 'Есть' : 'Нет'}
              </span>
            </div>

            {object.fauna_description && (
              <div className="p-2.5 rounded-lg bg-slate-800/30">
                <span className="text-slate-400 text-xs">Виды:</span>
                <p className="text-white text-sm mt-0.5">{object.fauna_description}</p>
              </div>
            )}

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
              <span className="text-slate-400 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Паспорт
              </span>
              <span className="text-white font-medium text-sm">
                {formatDate(object.passport_date)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
              <span className="text-slate-400 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                Координаты
              </span>
              <span className="text-white font-mono text-xs">
                {object.latitude.toFixed(4)}°, {object.longitude.toFixed(4)}°
              </span>
            </div>
          </div>

          {/* Description */}
          {object.description && (
            <div className="p-3 rounded-xl bg-slate-800/30">
              <p className="text-slate-300 text-sm">{object.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 shrink-0 bg-slate-900">
          <button
            onClick={() => alert('PDF паспорт в разработке')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Открыть паспорт
          </button>
        </div>
      </div>
    </div>
  )
}
