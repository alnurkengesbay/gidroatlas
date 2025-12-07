import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  X,
  MapPin,
  Droplet,
  Fish,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Waves,
  Target
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { objectsAPI } from '../api'

export default function Sidebar() {
  const { 
    filters, 
    setFilters, 
    resetFilters,
    showFilters,
    filteredObjects
  } = useStore()
  
  const [regions, setRegions] = useState([])
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    try {
      const data = await objectsAPI.getRegions()
      setRegions(data)
    } catch (error) {
      console.error('Error loading regions:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ search: searchValue })
  }

  const conditionConfig = {
    1: { color: 'bg-green-500', ring: 'ring-green-500/30', text: 'text-green-400' },
    2: { color: 'bg-lime-500', ring: 'ring-lime-500/30', text: 'text-lime-400' },
    3: { color: 'bg-yellow-500', ring: 'ring-yellow-500/30', text: 'text-yellow-400' },
    4: { color: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-400' },
    5: { color: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-400' }
  }

  const resourceTypes = [
    { value: 'озеро', label: 'Озеро', icon: '🏞️' },
    { value: 'канал', label: 'Канал', icon: '🌊' },
    { value: 'водохранилище', label: 'Водохранилище', icon: '💧' },
    { value: 'шлюз', label: 'Шлюз', icon: '🚢' },
    { value: 'гидроузел', label: 'Гидроузел', icon: '⚙️' },
    { value: 'плотина', label: 'Плотина', icon: '🏗️' }
  ]

  // Count active filters
  const activeFiltersCount = [
    filters.region,
    filters.resource_type,
    filters.water_type,
    filters.fauna,
    filters.priority_level,
    (filters.condition_min !== 1 || filters.condition_max !== 5)
  ].filter(Boolean).length

  return (
    <aside className={`fixed sm:relative inset-y-0 left-0 bg-slate-900/95 sm:bg-slate-900/80 backdrop-blur-xl border-r border-cyan-500/20 transition-all duration-300 z-[100] ${
      showFilters ? 'w-[85vw] sm:w-80 translate-x-0' : 'w-0 -translate-x-full sm:translate-x-0'
    } overflow-hidden flex flex-col`}>
      
      {/* Search */}
      <div className="p-4">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-all text-sm"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('')
                setFilters({ search: '' })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Filters header */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white text-sm">Фильтры</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Сбросить
        </button>
      </div>

      {/* Filters content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        
        {/* Region */}
        <FilterSection icon={MapPin} label="Область">
          <select
            value={filters.region}
            onChange={(e) => setFilters({ region: e.target.value })}
            className="select-styled"
          >
            <option value="">Все области</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </FilterSection>

        {/* Resource type */}
        <FilterSection icon={Droplet} label="Тип ресурса">
          <select
            value={filters.resource_type}
            onChange={(e) => setFilters({ resource_type: e.target.value })}
            className="select-styled"
          >
            <option value="">Все типы</option>
            {resourceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* Water type */}
        <FilterSection icon={Waves} label="Тип воды">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { value: '', label: 'Все' },
              { value: 'пресная', label: 'Пресная' },
              { value: 'непресная', label: 'Солёная' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilters({ water_type: opt.value })}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  filters.water_type === opt.value
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Fauna */}
        <FilterSection icon={Fish} label="Наличие фауны">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setFilters({ fauna: '' })}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                filters.fauna === ''
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilters({ fauna: 'true' })}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                filters.fauna === 'true'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'
              }`}
            >
              🐟 Есть
            </button>
            <button
              onClick={() => setFilters({ fauna: 'false' })}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                filters.fauna === 'false'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'
              }`}
            >
              ✕ Нет
            </button>
          </div>
        </FilterSection>

        {/* Technical condition */}
        <FilterSection icon={AlertTriangle} label="Состояние">
          <div className="space-y-2">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(num => {
                const isSelected = filters.condition_min === num && filters.condition_max === num
                const config = conditionConfig[num]
                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (isSelected) {
                        setFilters({ condition_min: 1, condition_max: 5 })
                      } else {
                        setFilters({ condition_min: num, condition_max: num })
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      isSelected
                        ? `${config.color} text-white shadow-lg ring-2 ${config.ring}`
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] px-1">
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Отлично
              </span>
              <span className="flex items-center gap-1 text-red-400">
                Критично
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </span>
            </div>
          </div>
        </FilterSection>

        {/* Priority */}
        <FilterSection icon={Target} label="Приоритет">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { value: '', label: 'Все', color: 'slate' },
              { value: 'high', label: '🔴', color: 'red' },
              { value: 'medium', label: '🟡', color: 'yellow' },
              { value: 'low', label: '🟢', color: 'green' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilters({ priority_level: opt.value })}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  filters.priority_level === opt.value
                    ? opt.value === '' 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : `bg-${opt.color}-500/20 text-${opt.color}-400 border border-${opt.color}-500/30`
                    : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Results count */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Найдено</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {filteredObjects.length}
            </span>
            <span className="text-xs text-slate-500">объектов</span>
          </div>
        </div>
        
        {/* Quick filter badges */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filters.region && (
              <FilterBadge 
                label={filters.region.split(' ')[0]} 
                onRemove={() => setFilters({ region: '' })} 
              />
            )}
            {filters.resource_type && (
              <FilterBadge 
                label={filters.resource_type} 
                onRemove={() => setFilters({ resource_type: '' })} 
              />
            )}
            {filters.water_type && (
              <FilterBadge 
                label={filters.water_type} 
                onRemove={() => setFilters({ water_type: '' })} 
              />
            )}
            {(filters.condition_min !== 1 || filters.condition_max !== 5) && (
              <FilterBadge 
                label={`Сост: ${filters.condition_min}`} 
                onRemove={() => setFilters({ condition_min: 1, condition_max: 5 })} 
              />
            )}
          </div>
        )}
      </div>

      {/* Custom styles for selects */}
      <style>{`
        .select-styled {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border-radius: 0.75rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(51, 65, 85, 0.5);
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }
        .select-styled:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.5);
          background-color: rgba(30, 41, 59, 0.8);
        }
        .select-styled option {
          background: #1e293b;
          color: white;
          padding: 0.5rem;
        }
      `}</style>
    </aside>
  )
}

// Filter section component
function FilterSection({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
    </div>
  )
}

// Filter badge component
function FilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
      {label}
      <button 
        onClick={onRemove}
        className="hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
