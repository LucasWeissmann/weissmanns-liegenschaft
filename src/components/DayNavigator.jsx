import { useState, useRef } from 'react'

const TZ = 'Europe/Berlin'

function formatDate(date) {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function toGermanDateKey(date) {
  return new Intl.DateTimeFormat('de-DE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function isToday(date) {
  return toGermanDateKey(date) === toGermanDateKey(new Date())
}

function toKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export default function DayNavigator({ date, onDateChange }) {
  const [direction, setDirection] = useState(null)
  const timeoutRef = useRef(null)

  const navigate = (offset) => {
    setDirection(offset > 0 ? 'right' : 'left')
    const next = new Date(date)
    next.setDate(next.getDate() + offset)
    onDateChange(next)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setDirection(null), 400)
  }

  const goToday = () => {
    if (isToday(date)) return
    setDirection('left')
    onDateChange(new Date())
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setDirection(null), 400)
  }

  const animClass = direction === 'left'
    ? 'animate-slide-from-left'
    : direction === 'right'
      ? 'animate-slide-from-right'
      : ''

  return (
    <div className="flex items-center justify-between py-4">
      <button
        onClick={() => navigate(-1)}
        className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 active:scale-95 transition-transform"
        aria-label="Vorheriger Tag"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button onClick={goToday} className="text-center min-w-0 flex-1 mx-3 overflow-hidden">
        <div key={toKey(date)} className={animClass}>
          {isToday(date) ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pool-700 bg-pool-100 px-2.5 py-0.5 rounded-full mb-1">
              <span className="w-1.5 h-1.5 bg-pool-500 rounded-full animate-pulse" />
              Heute
            </span>
          ) : (
            <span className="text-[11px] font-medium text-pool-600 mb-1 block">
              ← Zurück zu heute
            </span>
          )}
          <p className="text-[17px] font-bold text-gray-900 tracking-tight">{formatDate(date)}</p>
        </div>
      </button>

      <button
        onClick={() => navigate(1)}
        className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 active:scale-95 transition-transform"
        aria-label="Nächster Tag"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
