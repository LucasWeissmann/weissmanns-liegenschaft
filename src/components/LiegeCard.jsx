import TimelineBar from './TimelineBar'

const TZ = 'Europe/Berlin'
const DAY_START = 7 * 60
const DAY_END = 21 * 60

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function germanNowMinutes() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).map(p => [p.type, p.value])
  )
  return Number(parts.hour) * 60 + Number(parts.minute)
}

function formatHours(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function LiegeCard({ liegeNumber, bookings, isToday, onSlotClick, onBookingClick }) {
  const liegeBookings = bookings.filter((b) => b.liege === liegeNumber)

  const rangeStart = isToday ? Math.max(germanNowMinutes(), DAY_START) : DAY_START
  const remainingMinutes = Math.max(DAY_END - rangeStart, 0)

  const futureBookedMinutes = liegeBookings.reduce((sum, b) => {
    const bStart = Math.max(toMinutes(b.startTime), rangeStart)
    const bEnd = toMinutes(b.endTime)
    return sum + Math.max(bEnd - bStart, 0)
  }, 0)

  const freeMinutes = remainingMinutes - futureBookedMinutes

  let badgeText, badgeClass
  if (remainingMinutes <= 0) {
    badgeText = 'Tag vorbei'
    badgeClass = 'bg-gray-100 text-gray-500'
  } else if (liegeBookings.length === 0 && !isToday) {
    badgeText = 'Ganzer Tag frei'
    badgeClass = 'bg-pool-500/15 text-pool-700'
  } else if (freeMinutes <= 0) {
    badgeText = 'Ausgebucht'
    badgeClass = 'bg-rose-100 text-rose-700'
  } else {
    badgeText = `${formatHours(freeMinutes)} frei`
    badgeClass = isToday ? 'bg-pool-500/15 text-pool-700' : 'bg-sand-200/40 text-amber-800'
  }

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/60 cursor-pointer"
      onClick={() => onSlotClick(liegeNumber, '10:00')}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Liege {liegeNumber}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
          {badgeText}
        </span>
      </div>

      <TimelineBar
        bookings={liegeBookings}
        isToday={isToday}
        onSlotClick={(time) => onSlotClick(liegeNumber, time)}
        onBookingClick={onBookingClick}
      />
    </div>
  )
}
