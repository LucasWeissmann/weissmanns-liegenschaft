import { useState, useRef } from 'react'

const TZ = 'Europe/Berlin'

function formatDate(date) {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function toGermanDateKey(date) {
  return new Intl.DateTimeFormat('de-DE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function isToday(date) {
  return toGermanDateKey(date) === toGermanDateKey(new Date())
}

function toKey(date) {
  return toGermanDateKey(date)
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
    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/80 my-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          aria-label="Vorheriger Tag"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button onClick={goToday} className="text-center min-w-0 flex-1 overflow-hidden">
          <div key={toKey(date)} className={animClass}>
            <p className="font-semibold text-gray-900 text-[15px]">{formatDate(date)}</p>
            {isToday(date) && (
              <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 bg-pool-500 text-white text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Heute
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => navigate(1)}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          aria-label="Nächster Tag"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!isToday(date) && (
        <button
          onClick={goToday}
          className="w-full mt-3 py-2 bg-pool-500/15 text-pool-700 rounded-2xl text-sm font-medium active:scale-[0.98] transition-all"
        >
          Zurück zu heute
        </button>
      )}
    </div>
  )
}
