import TimelineBar from './TimelineBar'

export default function LiegeCard({ liegeNumber, bookings, isToday, onSlotClick, onBookingClick }) {
  const liegeBookings = bookings.filter((b) => b.liege === liegeNumber)
  const count = liegeBookings.length

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/60 cursor-pointer"
      onClick={() => onSlotClick(liegeNumber, '10:00')}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Liege {liegeNumber}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          count === 0
            ? 'bg-pool-500/15 text-pool-700'
            : 'bg-sand-200/40 text-amber-800'
        }`}>
          {count === 0 ? 'Frei' : `${count} Buchung${count > 1 ? 'en' : ''}`}
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
