import { useState, useEffect } from 'react'
import { AlertTriangle, Droplets, Shield, Zap, Activity } from 'lucide-react'

// Animated counter hook
function useAnimatedCounter(target, duration = 1500) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (target === 0) return setCount(0)
    
    let startTime
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * target))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [target, duration])
  
  return count
}

// Circular progress component
function CircularProgress({ value, max, color, size = 56 }) {
  const percentage = (value / max) * 100
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="5"
      />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

export default function StatsPanel({ stats }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])
  
  if (!stats) return null

  const criticalCount = stats.byCondition
    ?.filter(c => c.technical_condition >= 4)
    ?.reduce((sum, c) => sum + c.count, 0) || 0
    
  const goodCount = stats.byCondition
    ?.filter(c => c.technical_condition <= 2)
    ?.reduce((sum, c) => sum + c.count, 0) || 0
    
  const healthScore = Math.round(((stats.total - criticalCount) / stats.total) * 100)
  
  // Animated values
  const animatedTotal = useAnimatedCounter(stats.total)
  const animatedCritical = useAnimatedCounter(criticalCount)
  const animatedGood = useAnimatedCounter(goodCount)
  const animatedHealth = useAnimatedCounter(healthScore)

  return (
    <div className={`fixed bottom-4 left-4 sm:bottom-auto sm:left-auto sm:top-20 sm:right-4 z-[1000] transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
    }`}>
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-3 sm:p-4 shadow-2xl w-auto sm:w-[260px] overflow-hidden">
        
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-none">Мониторинг</h3>
              <p className="text-[9px] text-cyan-400/70 uppercase tracking-wider">Live</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] text-green-400 font-medium">ONLINE</span>
          </div>
        </div>

        {/* Main counter */}
        <div className="text-center mb-3 py-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/10">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Всего объектов</p>
          <div className="flex items-center justify-center gap-2">
            <Droplets className="w-6 h-6 text-cyan-400" />
            <span className="text-4xl font-black text-white">
              {animatedTotal}
            </span>
          </div>
        </div>

        {/* Health Score */}
        <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-slate-800/50">
          <div className="relative flex items-center justify-center shrink-0">
            <CircularProgress 
              value={healthScore} 
              max={100} 
              color={healthScore > 70 ? '#22c55e' : healthScore > 40 ? '#eab308' : '#ef4444'}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{animatedHealth}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="text-xs font-semibold text-white">Health Score</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {healthScore > 70 ? 'Система в норме' : healthScore > 40 ? 'Требует внимания' : 'Критическое'}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-1.5 mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[9px] text-red-300 uppercase">Критичных</span>
            </div>
            <span className="text-xl font-black text-red-400">{animatedCritical}</span>
          </div>
          
          <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[9px] text-green-300 uppercase">Хороших</span>
            </div>
            <span className="text-xl font-black text-green-400">{animatedGood}</span>
          </div>
        </div>

        {/* Condition bars */}
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">По категориям</p>
          <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-slate-800">
            {[1, 2, 3, 4, 5].map(cond => {
              const count = stats.byCondition?.find(c => c.technical_condition === cond)?.count || 0
              const width = (count / stats.total) * 100
              const colors = {
                1: 'bg-green-500',
                2: 'bg-lime-500',
                3: 'bg-yellow-500',
                4: 'bg-orange-500',
                5: 'bg-red-500'
              }
              return (
                <div
                  key={cond}
                  className={`${colors[cond]} transition-all duration-1000`}
                  style={{ width: `${Math.max(width, 3)}%` }}
                  title={`Категория ${cond}: ${count}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            {[1, 2, 3, 4, 5].map(cond => {
              const count = stats.byCondition?.find(c => c.technical_condition === cond)?.count || 0
              const colors = {
                1: 'text-green-400',
                2: 'text-lime-400',
                3: 'text-yellow-400',
                4: 'text-orange-400',
                5: 'text-red-400'
              }
              return (
                <div key={cond} className="text-center flex-1">
                  <span className={`text-[10px] font-medium ${colors[cond]}`}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
