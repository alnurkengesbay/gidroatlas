import { useRef } from 'react'
import { X, FileText, MapPin, Droplet, Fish, Calendar, AlertTriangle, Download, Printer, Stamp } from 'lucide-react'
import html2pdf from 'html2pdf.js'

const conditionLabels = {
  1: { text: 'Отличное', color: 'text-green-600' },
  2: { text: 'Хорошее', color: 'text-lime-600' },
  3: { text: 'Удовлетворительное', color: 'text-yellow-600' },
  4: { text: 'Неудовлетворительное', color: 'text-orange-600' },
  5: { text: 'Аварийное', color: 'text-red-600' }
}

export default function PassportModal({ object, onClose }) {
  const contentRef = useRef(null)
  const condition = conditionLabels[object.technical_condition]
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!contentRef.current) return

    const opt = {
      margin: 10,
      filename: `passport_${object.id}_${object.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    }

    // Temporarily hide buttons for PDF
    const buttons = contentRef.current.parentElement.querySelector('.print\\:hidden')
    if (buttons) buttons.style.display = 'none'

    await html2pdf().set(opt).from(contentRef.current).save()

    // Restore buttons
    if (buttons) buttons.style.display = ''
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-[#faf8f5] rounded-lg shadow-2xl print:shadow-none print:max-h-none print:overflow-visible">
        {/* Header buttons - hide on print */}
        <div className="absolute top-4 right-4 flex gap-2 print:hidden z-10">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
            title="Скачать"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors"
            title="Печать"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document content */}
        <div ref={contentRef} className="p-8 text-slate-800">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-300 pb-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center">
                <Droplet className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">
              Республика Казахстан
            </p>
            <p className="text-sm text-slate-500 mb-3">
              Комитет по водным ресурсам
            </p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-wide">
              ПАСПОРТ ВОДНОГО ОБЪЕКТА
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              № {String(object.id).padStart(6, '0')}-{new Date(object.passport_date).getFullYear()}
            </p>
          </div>

          {/* Object name */}
          <div className="bg-slate-100 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-slate-500 mb-1">Наименование объекта</p>
            <h2 className="text-xl font-bold text-slate-800">{object.name}</h2>
            <p className="text-sm text-slate-600 mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4" />
              {object.region}
            </p>
          </div>

          {/* Main info grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Тип объекта</p>
              <p className="font-semibold text-slate-800 capitalize">{object.resource_type}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Тип воды</p>
              <p className="font-semibold text-slate-800 capitalize">{object.water_type || 'Не указан'}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Наличие фауны</p>
              <p className={`font-semibold ${object.fauna ? 'text-green-600' : 'text-slate-400'}`}>
                {object.fauna ? '✓ Присутствует' : '✗ Отсутствует'}
              </p>
              {object.fauna_description && (
                <p className="text-xs text-slate-500 mt-1">{object.fauna_description}</p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Дата паспортизации</p>
              <p className="font-semibold text-slate-800">{formatDate(object.passport_date)}</p>
            </div>
          </div>

          {/* Technical condition */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Техническое состояние
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${
                object.technical_condition === 1 ? 'bg-green-500' :
                object.technical_condition === 2 ? 'bg-lime-500' :
                object.technical_condition === 3 ? 'bg-yellow-500' :
                object.technical_condition === 4 ? 'bg-orange-500' : 'bg-red-500'
              }`}>
                {object.technical_condition}
              </div>
              <div>
                <p className={`text-lg font-bold ${condition.color}`}>
                  {condition.text}
                </p>
                <p className="text-sm text-slate-500">
                  Категория {object.technical_condition} из 5
                </p>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Географические координаты</p>
            <div className="flex gap-6">
              <div>
                <span className="text-slate-500 text-sm">Широта:</span>
                <span className="font-mono font-semibold text-slate-800 ml-2">
                  {object.latitude.toFixed(6)}°
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Долгота:</span>
                <span className="font-mono font-semibold text-slate-800 ml-2">
                  {object.longitude.toFixed(6)}°
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {object.description && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Описание</p>
              <p className="text-slate-700 text-sm leading-relaxed">{object.description}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-slate-300 pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                <p>Документ сформирован автоматически</p>
                <p>Система GidroAtlas v1.0</p>
                <p>{new Date().toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Stamp className="w-12 h-12 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

