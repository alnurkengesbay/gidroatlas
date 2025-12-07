import { useState, useRef } from 'react'
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  FileJson,
  Table,
  FileText,
  File
} from 'lucide-react'
import api from '../api'

export default function FileUpload({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (f) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json', '.pdf', '.doc', '.docx']
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(ext)) {
      setError('Поддерживаются: CSV, Excel, JSON, PDF, Word')
      return
    }
    
    if (f.size > 20 * 1024 * 1024) {
      setError('Файл слишком большой (макс. 20MB)')
      return
    }
    
    setFile(f)
    setError(null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress('Загрузка файла...')
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProgress('🔄 Парсинг файла...')
      
      // Simulate progress updates
      setTimeout(() => setProgress('🤖 AI стандартизация данных...'), 1000)
      setTimeout(() => setProgress('📊 Обработка записей...'), 3000)
      setTimeout(() => setProgress('💾 Сохранение в базу данных...'), 5000)

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResult(response.data)
      setProgress('')
      
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки файла')
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12 text-slate-500" />
    const ext = file.name.toLowerCase()
    if (ext.endsWith('.json')) return <FileJson className="w-12 h-12 text-yellow-500" />
    if (ext.endsWith('.csv')) return <Table className="w-12 h-12 text-green-500" />
    if (ext.endsWith('.pdf')) return <FileText className="w-12 h-12 text-red-500" />
    if (ext.endsWith('.doc') || ext.endsWith('.docx')) return <File className="w-12 h-12 text-blue-500" />
    return <FileSpreadsheet className="w-12 h-12 text-emerald-500" />
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Импорт данных</h2>
              <p className="text-sm text-slate-400">AI автоматически стандартизирует данные</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              file 
                ? 'border-cyan-500/50 bg-cyan-500/5' 
                : 'border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-3">
              {getFileIcon()}
              
              {file ? (
                <>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-300">
                    Перетащите файл или нажмите для выбора
                  </p>
                  <p className="text-sm text-slate-500">
                    CSV, Excel, JSON, PDF, Word (макс. 20MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* AI info */}
          <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Извлечение и Стандартизация</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              <strong>PDF/Word:</strong> AI извлечёт все водные объекты из текста документа<br/>
              <strong>CSV/Excel:</strong> AI стандартизирует данные в единый формат
            </p>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="mt-4 p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-slate-300">{progress}</span>
              </div>
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Импорт завершён!</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-slate-800/50">
                  <p className="text-2xl font-bold text-white">{result.original_count}</p>
                  <p className="text-xs text-slate-400">Загружено</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50">
                  <p className="text-2xl font-bold text-cyan-400">{result.standardized_count}</p>
                  <p className="text-xs text-slate-400">Обработано AI</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50">
                  <p className="text-2xl font-bold text-green-400">{result.saved_count}</p>
                  <p className="text-xs text-slate-400">Добавлено</p>
                </div>
              </div>
              
              {result.errors?.length > 0 && (
                <div className="mt-3 text-xs text-orange-400">
                  ⚠️ {result.errors.length} записей с ошибками
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
          >
            {result ? 'Закрыть' : 'Отмена'}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Импортировать
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

