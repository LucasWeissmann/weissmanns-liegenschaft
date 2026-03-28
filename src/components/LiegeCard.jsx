import TimelineBar from './TimelineBar'

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatHours(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function LiegeCard({ liegeNumber, bookings, isToday, onSlotClick, onBookingClick }) {
  const liegeBookings = bookings.filter((b) => b.liege === liegeNumber)

  const bookedMinutes = liegeBookings.reduce((sum, b) =>
    sum + toMinutes(b.endTime) - toMinutes(b.startTime), 0
  )
  const totalMinutes = (21 - 7) * 60
  const freeMinutes = totalMinutes - bookedMinutes

  let badgeText, badgeClass
  if (liegeBookings.length === 0) {
    badgeText = 'Ganzer Tag frei'
    badgeClass = 'bg-pool-500/15 text-pool-700'
  } else if (freeMinutes <= 0) {
    badgeText = 'Ausgebucht'
    badgeClass = 'bg-rose-100 text-rose-700'
  } else {
    badgeText = `${formatHours(freeMinutes)} frei`
    badgeClass = 'bg-sand-200/40 text-amber-800'
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
