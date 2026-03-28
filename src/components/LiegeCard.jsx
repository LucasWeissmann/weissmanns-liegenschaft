import TimelineBar from './TimelineBar'

export default function LiegeCard({ liegeNumber, bookings, isToday, onSlotClick, onBookingClick }) {
  const liegeBookings = bookings.filter((b) => b.liege === liegeNumber)
  const count = liegeBookings.length

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm shadow-gray-200/50 border border-white/60">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-pool-100 flex items-center justify-center">
          <span className="text-sm font-bold text-pool-700">{liegeNumber}</span>
        </div>
        <h2 className="text-[15px] font-semibold text-gray-900">
          Liege {liegeNumber}
        </h2>
        <span className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full ${
          count === 0
            ? 'text-emerald-700 bg-emerald-50'
            : 'text-pool-700 bg-pool-50'
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
