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

const PASTEL_COLORS = [
  { bg: '#a8dadc', text: '#1d3557' },
  { bg: '#f1c0e8', text: '#5a1846' },
  { bg: '#b9fbc0', text: '#1b4332' },
  { bg: '#ffd6a5', text: '#7c4a03' },
  { bg: '#bdb2ff', text: '#2d1b69' },
  { bg: '#caffbf', text: '#1a5c1a' },
  { bg: '#ffc6ff', text: '#6b1a6b' },
  { bg: '#a0c4ff', text: '#1a3a6b' },
]

const TIME_LABELS = [
  { hour: 7, label: '7:00' },
  { hour: 14, label: '14:00' },
  { hour: 21, label: '21:00' },
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
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length]
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
    <div>
      {showNow && (
        <div className="relative h-5 mb-0.5 pointer-events-none">
          <span
            className="absolute -translate-x-1/2 text-[8px] font-bold bg-rose-500 text-white rounded-full px-2 py-0.5 leading-none shadow-sm"
            style={{ left: `${nowPosition}%` }}
          >
            Jetzt
          </span>
        </div>
      )}
      <div
        className="relative h-12 bg-pool-50/60 rounded-2xl overflow-hidden cursor-pointer border border-pool-100/40"
        onClick={(e) => {
          e.stopPropagation()
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
            className="absolute top-0 bottom-0 w-px bg-pool-200/30"
            style={{ left: `${((i + 1) / TOTAL_HOURS) * 100}%` }}
          />
        ))}

        {showNow && (
          <div
            className="absolute z-20 pointer-events-none flex flex-col items-center -translate-x-1/2"
            style={{ left: `${nowPosition}%`, top: 0, bottom: 0 }}
          >
            <div className="w-[2px] h-full bg-rose-500/60" />
            <div className="absolute top-0.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40 animate-pulse-dot" />
          </div>
        )}

        {bookings.map((b) => {
          const bStart = toMinutes(b.startTime) - START_HOUR * 60
          const bEnd = toMinutes(b.endTime) - START_HOUR * 60
          const left = (bStart / TOTAL_MINUTES) * 100
          const width = ((bEnd - bStart) / TOTAL_MINUTES) * 100
          const color = getColor(b.name)

          const isMedium = width > 10
          const isWide = width > 18
          const initial = b.name.charAt(0).toUpperCase()

          return (
            <button
              key={b.id}
              onClick={(e) => {
                e.stopPropagation()
                onBookingClick?.(b)
              }}
              className="absolute top-1 bottom-1 rounded-xl font-semibold flex items-center justify-center shadow-sm active:scale-[0.97] transition-all animate-scale-in overflow-hidden"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: color.bg,
                color: color.text,
              }}
              title={`${b.name}: ${b.startTime} – ${b.endTime}`}
            >
              {isWide ? (
                <span className="truncate text-[11px] leading-tight px-1.5">{b.name}</span>
              ) : isMedium ? (
                <span className="text-[11px] leading-tight font-bold">{initial}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1 mt-1.5">
        {TIME_LABELS.map(({ hour, label }) => (
          <span key={hour}>{label}</span>
        ))}
      </div>

      {bookings.length > 0 && (
        <div className="mt-2.5 space-y-1">
          {bookings.map((b) => {
            const color = getColor(b.name)
            return (
              <button
                key={b.id}
                onClick={() => onBookingClick?.(b)}
                className="flex items-center gap-2 w-full text-left px-1 py-1 rounded-lg active:bg-black/5 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.bg }} />
                <span className="text-[13px] font-medium text-gray-800 truncate">{b.name}</span>
                <span className="text-[12px] text-gray-400 ml-auto shrink-0">{b.startTime}–{b.endTime}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
