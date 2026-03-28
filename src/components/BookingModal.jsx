import { useState } from 'react'

const TZ = 'Europe/Berlin'

function generateTimeOptions() {
  const options = []
  for (let h = 7; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 21 && m > 0) break
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

function germanNowTimeStr() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).map(p => [p.type, p.value])
  )
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

function snapToNearest(time, minTime) {
  const [h, m] = time.split(':').map(Number)
  const snapped = m < 15 ? '00' : m < 45 ? '30' : '00'
  const hour = m >= 45 ? h + 1 : h
  if (hour > 21) return '21:00'
  if (hour < 7) return '07:00'
  const result = `${String(hour).padStart(2, '0')}:${snapped}`
  if (minTime && result < minTime) return minTime
  return result
}

function defaultEndTime(startTime) {
  const [h, m] = startTime.split(':').map(Number)
  const endH = Math.min(h + 2, 21)
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function SelectChevron() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export default function BookingModal({ liege, initialTime, isToday, onBook, onClose, error }) {
  const nowStr = isToday ? germanNowTimeStr() : null
  const minStart = isToday ? snapToNearest(nowStr, null) : null
  const snapped = snapToNearest(initialTime || '10:00', minStart)
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState(snapped)
  const [endTime, setEndTime] = useState(defaultEndTime(snapped))
  const [submitting, setSubmitting] = useState(false)

  const startOptions = isToday ? TIME_OPTIONS.filter(t => t >= minStart) : TIME_OPTIONS
  const isValid = name.trim().length > 0 && startTime < endTime

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await onBook({ liege, name, startTime, endTime })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 pb-safe shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-sand-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pool-500/15 flex items-center justify-center">
              <span className="text-sm font-bold text-pool-700">{liege}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Liege {liege} buchen</h3>
              <p className="text-sm text-gray-500">Wähle Name und Zeitraum</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Dein Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Lucas"
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pool-400/50 focus:border-pool-400 transition-shadow text-[15px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Von
              </label>
              <div className="relative">
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value)
                    if (e.target.value >= endTime) {
                      setEndTime(defaultEndTime(e.target.value))
                    }
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pool-400/50 focus:border-pool-400 appearance-none pr-10 text-[15px]"
                >
                  {startOptions.map((t) => (
                    <option key={t} value={t}>{t} Uhr</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Bis
              </label>
              <div className="relative">
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pool-400/50 focus:border-pool-400 appearance-none pr-10 text-[15px]"
                >
                  {TIME_OPTIONS.filter((t) => t > startTime && (!minStart || t >= minStart)).map((t) => (
                    <option key={t} value={t}>{t} Uhr</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pool-500 to-pool-600 text-white font-bold text-base shadow-lg shadow-pool-500/25 disabled:opacity-40 disabled:shadow-none active:scale-[0.98] transition-all"
          >
            {submitting ? 'Wird gebucht…' : 'Jetzt buchen'}
          </button>
        </form>
      </div>
    </div>
  )
}
