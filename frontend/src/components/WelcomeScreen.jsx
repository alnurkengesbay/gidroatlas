import { useState, useEffect } from 'react'
import { Map, BarChart3, Bot, ArrowRight, Sparkles } from 'lucide-react'
import logo from '../assets/logo.png'

const features = [
  {
    icon: Map,
    title: 'Интерактивная карта',
    description: 'Все водные объекты Казахстана',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    description: 'Приоритизация и прогнозы',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Bot,
    title: 'AI Ассистент',
    description: 'GPT-4o powered консультант',
    color: 'from-orange-500 to-red-500'
  }
]

export default function WelcomeScreen({ onComplete }) {
  const [stage, setStage] = useState(0)
  const [showFeatures, setShowFeatures] = useState(false)
  
  useEffect(() => {
    // Stage animations
    const timer1 = setTimeout(() => setStage(1), 500)
    const timer2 = setTimeout(() => setStage(2), 1200)
    const timer3 = setTimeout(() => setShowFeatures(true), 1800)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/50 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* Logo animation */}
        <div className={`transition-all duration-1000 ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="relative inline-block mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
            
            {/* Icon container */}
            <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-1 shadow-2xl shadow-cyan-500/30">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center">
                <img src={logo} alt="GidroAtlas" className="w-16 h-16 rounded-xl" />
              </div>
            </div>
            
            {/* Sparkle */}
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-spin-slow" />
          </div>
        </div>

        {/* Title */}
        <div className={`transition-all duration-1000 delay-300 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl font-black mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              GidroAtlas
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-2">
            Система мониторинга водных ресурсов
          </p>
          <p className="text-sm text-slate-500">
            🇰🇿 Республика Казахстан
          </p>
        </div>

        {/* Features */}
        <div className={`mt-10 grid grid-cols-3 gap-4 transition-all duration-1000 ${showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-105 group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className={`mt-10 transition-all duration-1000 delay-500 ${showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={onComplete}
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-3">
              Начать работу
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
          
          <p className="mt-4 text-xs text-slate-600">
            Нажмите Enter или кликните для продолжения
          </p>
        </div>
      </div>

      {/* Version badge */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-600">
        v1.0.0 • Hackathon Edition
      </div>
      
      {/* Tech stack */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-600">
        <span>React</span>
        <span>•</span>
        <span>Leaflet</span>
        <span>•</span>
        <span>GPT-4o</span>
      </div>
    </div>
  )
}

