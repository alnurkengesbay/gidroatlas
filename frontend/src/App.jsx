import { useEffect, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import { objectsAPI, authAPI } from './api'
import Header from './components/Header'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import ObjectCard from './components/ObjectCard'
import PriorityTable from './components/PriorityTable'
import AIAssistant from './components/AIAssistant'
import LoginModal from './components/LoginModal'
import StatsPanel from './components/StatsPanel'
import WelcomeScreen from './components/WelcomeScreen'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import FileUpload from './components/FileUpload'

function App() {
  const { 
    setObjects, 
    selectedObject, 
    setSelectedObject,
    showPriorityTable,
    showAssistant,
    togglePriorityTable,
    toggleAssistant,
    isAuthenticated,
    token,
    setUser
  } = useStore()
  
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [stats, setStats] = useState(null)
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('gidroatlas_visited')
  })
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Don't trigger if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    
    // ? - show shortcuts
    if (e.key === '?') {
      setShowShortcuts(prev => !prev)
    }
    
    // Escape - close panels
    if (e.key === 'Escape') {
      setSelectedObject(null)
      setShowShortcuts(false)
    }
    
    // Expert shortcuts
    if (isAuthenticated) {
      // P - priority table
      if (e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З') {
        togglePriorityTable()
      }
      // A - AI assistant
      if (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
        toggleAssistant()
      }
    }
  }, [isAuthenticated, setSelectedObject, togglePriorityTable, toggleAssistant])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    loadData()
    if (token) {
      verifyToken()
    }
  }, [])

  const loadData = async () => {
    try {
      const [objectsData, statsData] = await Promise.all([
        objectsAPI.getAll({ limit: 200 }),
        objectsAPI.getStats()
      ])
      setObjects(objectsData.data)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyToken = async () => {
    try {
      const data = await authAPI.verify()
      if (data.valid) {
        setUser(data.user, token)
      }
    } catch (error) {
      console.error('Token verification failed')
    }
  }

  const handleWelcomeComplete = () => {
    localStorage.setItem('gidroatlas_visited', 'true')
    setShowWelcome(false)
  }

  // Welcome screen
  if (showWelcome && !loading) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-hydro-950">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-hydro-400/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-hydro-400 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-hydro-400/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">💧</span>
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">GidroAtlas</h2>
          <p className="text-hydro-300">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Header 
        onLoginClick={() => setShowLogin(true)} 
        onShowShortcuts={() => setShowShortcuts(true)} 
        onShowUpload={() => setShowUpload(true)}
      />
      
      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 relative">
          <Map />
        </main>
        
        {/* Priority table */}
        {showPriorityTable && <PriorityTable />}
        
        {/* AI Assistant */}
        {showAssistant && <AIAssistant />}
      </div>
      
      {/* Stats panel - at root level */}
      {stats && <StatsPanel stats={stats} />}
      
      {/* Object card - at root level to avoid all overflow issues */}
      {selectedObject && (
        <ObjectCard 
          object={selectedObject} 
          onClose={() => setSelectedObject(null)} 
        />
      )}
      
      {/* Login modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      
      {/* Keyboard shortcuts modal */}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
      
      {/* File upload modal */}
      {showUpload && (
        <FileUpload 
          onClose={() => setShowUpload(false)} 
          onSuccess={() => {
            // Reload data after successful import
            loadData()
          }}
        />
      )}
    </div>
  )
}

export default App

