import { useState, useEffect } from 'react'

const START_HOUR = 7
const END_HOUR = 21
const TOTAL_HOURS = END_HOUR - START_HOUR
const TOTAL_MINUTES = TOTAL_HOURS * 60
const TZ = 'Europe/Berlin'

function germanNowMinutes() {
  const now = new Date()
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(now).map(p => [p.type, p.value])
  )
  return Number(parts.hour) * 60 + Number(parts.minute)
}

const BOOKING_COLORS = [
  { bg: '#0d9488', light: '#5eead4' },
  { bg: '#d97706', light: '#fbbf24' },
  { bg: '#7c3aed', light: '#a78bfa' },
  { bg: '#db2777', light: '#f472b6' },
  { bg: '#0284c7', light: '#38bdf8' },
  { bg: '#ea580c', light: '#fb923c' },
  { bg: '#059669', light: '#6ee7b7' },
  { bg: '#4338ca', light: '#818cf8' },
]

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return BOOKING_COLORS[Math.abs(hash) % BOOKING_COLORS.length]
}

export default function TimelineBar({ bookings, isToday, onSlotClick, onBookingClick }) {
  const [nowMinutes, setNowMinutes] = useState(germanNowMinutes)

  useEffect(() => {
    if (!isToday) return
    const timer = setInterval(() => setNowMinutes(germanNowMinutes()), 60000)
    return () => clearInterval(timer)
  }, [isToday])

  const showNow = isToday && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60
  const nowPosition = showNow
    ? ((nowMinutes - START_HOUR * 60) / TOTAL_MINUTES) * 100
    : null

  return (
    <div className="mt-1">
      <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5 mb-1.5">
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
          const hour = START_HOUR + i
          if (i % 2 !== 0 && i !== TOTAL_HOURS) return <span key={hour} />
          return <span key={hour}>{hour}</span>
        })}
      </div>

      <div
        className="relative h-16 bg-gray-50 rounded-2xl overflow-hidden cursor-pointer border border-gray-100"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const pct = x / rect.width
          const minute = Math.round(pct * TOTAL_MINUTES + START_HOUR * 60)
          const hour = Math.floor(minute / 60)
          const mins = Math.round((minute % 60) / 30) * 30
          const time = `${String(hour).padStart(2, '0')}:${String(mins === 60 ? 0 : mins).padStart(2, '0')}`
          onSlotClick?.(time)
        }}
      >
        {Array.from({ length: TOTAL_HOURS - 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-gray-200/50"
            style={{ left: `${((i + 1) / TOTAL_HOURS) * 100}%` }}
          />
        ))}

        {showNow && (
          <div
            className="absolute bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `${nowPosition}%`, top: '-18px' }}
          >
            <span className="text-[7px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-px leading-tight mb-0.5 shadow-sm shadow-rose-500/30">
              Jetzt
            </span>
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <div className="w-[1.5px] flex-1 bg-rose-500/40" />
          </div>
        )}

        {bookings.map((b) => {
          const bStart = toMinutes(b.startTime) - START_HOUR * 60
          const bEnd = toMinutes(b.endTime) - START_HOUR * 60
          const left = (bStart / TOTAL_MINUTES) * 100
          const width = ((bEnd - bStart) / TOTAL_MINUTES) * 100
          const color = getColor(b.name)

          const isWide = width > 15
          const startH = b.startTime.split(':')[0].replace(/^0/, '')
          const endH = b.endTime.split(':')[0].replace(/^0/, '')

          return (
            <button
              key={b.id}
              onClick={(e) => {
                e.stopPropagation()
                onBookingClick?.(b)
              }}
              className="absolute top-1.5 bottom-1.5 rounded-xl text-white font-semibold flex flex-col items-center justify-center px-2 shadow-md active:scale-[0.97] transition-all animate-scale-in overflow-hidden"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: `linear-gradient(135deg, ${color.light} 0%, ${color.bg} 100%)`,
              }}
              title={`${b.name}: ${b.startTime} – ${b.endTime}`}
            >
              <span className="truncate drop-shadow-sm text-[11px] leading-tight">{b.name}</span>
              {isWide && (
                <span className="text-[9px] opacity-80 leading-tight">{startH}–{endH}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
