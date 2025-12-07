import { useState, useEffect } from 'react'
import { 
  X, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  AlertTriangle,
  Calendar,
  MapPin,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { analyticsAPI } from '../api'

const conditionColors = {
  1: 'bg-gradient-to-br from-green-500 to-emerald-600',
  2: 'bg-gradient-to-br from-lime-500 to-green-600',
  3: 'bg-gradient-to-br from-yellow-500 to-orange-500',
  4: 'bg-gradient-to-br from-orange-500 to-red-500',
  5: 'bg-gradient-to-br from-red-500 to-rose-600'
}

const priorityStyles = {
  high: { 
    bg: 'bg-gradient-to-r from-red-500/20 to-orange-500/10', 
    text: 'text-red-400',
    border: 'border-red-500/30',
    label: 'ВЫСОКИЙ',
    icon: '🔴'
  },
  medium: { 
    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10', 
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    label: 'СРЕДНИЙ',
    icon: '🟡'
  },
  low: { 
    bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/10', 
    text: 'text-green-400',
    border: 'border-green-500/30',
    label: 'НИЗКИЙ',
    icon: '🟢'
  }
}

export default function PriorityTable() {
  const { togglePriorityTable, setSelectedObject, setMapView } = useStore()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('priority')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [sortBy, sortOrder])

  const loadData = async () => {
    try {
      const result = await analyticsAPI.getPriorityTable({
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 100
      })
      setData(result.data)
    } catch (error) {
      console.error('Error loading priority table:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
      : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
  }

  const handleRowClick = (obj) => {
    setSelectedObject(obj)
    setMapView([obj.latitude, obj.longitude], 10)
  }

  // Filter and search
  const filteredData = data.filter(obj => {
    const matchesFilter = filter === 'all' || obj.priority?.level === filter
    const matchesSearch = !search || obj.name.toLowerCase().includes(search.toLowerCase()) || obj.region.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Stats
  const stats = {
    high: data.filter(d => d.priority?.level === 'high').length,
    medium: data.filter(d => d.priority?.level === 'medium').length,
    low: data.filter(d => d.priority?.level === 'low').length
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-16 sm:bottom-0 w-full sm:w-[520px] z-[9999]">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none"></div>
      
      <div className="relative h-full bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-xl border-l border-cyan-500/30 flex flex-col shadow-2xl shadow-cyan-500/5">
        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-40"></div>
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Приоритеты</h3>
                <p className="text-xs text-slate-400">Объекты для обследования</p>
              </div>
            </div>
            <button
              onClick={togglePriorityTable}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats badges */}
          <div className="flex gap-2 mb-4">
            {Object.entries(priorityStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? 'all' : key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  filter === key 
                    ? `${style.bg} ${style.border} ${style.text}` 
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span>{style.icon}</span>
                <span className="text-sm font-medium">{stats[key]}</span>
              </button>
            ))}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm hover:text-white transition-colors"
              >
                Все
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Поиск по названию или региону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 text-sm">Загрузка данных...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-900/98 backdrop-blur-sm z-10">
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                    >
                      Объект
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      onClick={() => handleSort('condition')}
                      className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <SortIcon field="condition" />
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      onClick={() => handleSort('passport_date')}
                      className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <SortIcon field="passport_date" />
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      onClick={() => handleSort('priority')}
                      className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                    >
                      Приоритет
                      <SortIcon field="priority" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredData.map((obj, idx) => {
                  const pStyle = priorityStyles[obj.priority?.level] || priorityStyles.low
                  return (
                    <tr
                      key={obj.id}
                      onClick={() => handleRowClick(obj)}
                      className="group hover:bg-white/5 cursor-pointer transition-all"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-white font-medium text-sm truncate max-w-[180px] group-hover:text-cyan-300 transition-colors">
                            {obj.name}
                          </p>
                          <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {obj.region.split(' ')[0]}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className={`w-9 h-9 rounded-xl ${conditionColors[obj.technical_condition]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                          {obj.technical_condition}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm">
                          <p className="text-slate-300">
                            {new Date(obj.passport_date).toLocaleDateString('ru-RU', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-slate-600 text-xs">
                            {Math.floor((Date.now() - new Date(obj.passport_date)) / (1000 * 60 * 60 * 24 * 365))} лет
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${pStyle.bg} ${pStyle.border}`}>
                          <span>{pStyle.icon}</span>
                          <span className={`text-xs font-bold ${pStyle.text}`}>
                            {obj.priority?.score}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          
          {!loading && filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Filter className="w-12 h-12 mb-3 opacity-30" />
              <p>Нет объектов по фильтру</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              📊 Формула: (6 - состояние) × 3 + возраст паспорта
            </span>
            <span className="text-cyan-400">
              {filteredData.length} из {data.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
