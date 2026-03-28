import { useState, useEffect } from 'react'
import DayNavigator from './components/DayNavigator'
import LiegeCard from './components/LiegeCard'
import BookingModal from './components/BookingModal'
import DeleteConfirm from './components/DeleteConfirm'
import { subscribeToBookings, createBooking, removeBooking, hasOverlap } from './lib/firebase'

const TZ = 'Europe/Berlin'

function germanDateParts(date) {
  const fmt = new Intl.DateTimeFormat('de-DE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]))
  return { year: parts.year, month: parts.month, day: parts.day }
}

function toDateString(date) {
  const { year, month, day } = germanDateParts(date)
  return `${year}-${month}-${day}`
}

function checkIsToday(date) {
  const now = new Date()
  return toDateString(date) === toDateString(now)
}

export default function App() {
  const [date, setDate] = useState(new Date())
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  const [bookingModal, setBookingModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [bookingError, setBookingError] = useState(null)

  const dateStr = toDateString(date)
  const isToday = checkIsToday(date)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToBookings(dateStr, (data) => {
      setBookings(data)
      setLoading(false)
      setInitialLoad(false)
    })
    return unsubscribe
  }, [dateStr])

  const handleSlotClick = (liege, time) => {
    setBookingError(null)
    setBookingModal({ liege, time })
  }

  const handleBook = async ({ liege, name, startTime, endTime }) => {
    if (hasOverlap(bookings, liege, startTime, endTime)) {
      setBookingError('Diese Zeit ist bereits belegt. Bitte wähle eine andere Zeit.')
      return
    }

    await createBooking({ liege, date: dateStr, startTime, endTime, name })
    setBookingModal(null)
    setBookingError(null)
  }

  const handleDelete = async (bookingId) => {
    await removeBooking(bookingId)
    setDeleteModal(null)
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="pt-safe px-5 pt-5 pb-1">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="w-8 h-8 rounded-xl" />
            <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
              Weißmanns Liegenschaft
            </h1>
          </div>
          <p className="text-[11px] text-gray-400 font-medium tracking-widest uppercase mt-1">
            Poolseite · Familie Weißmann
          </p>
        </div>
      </header>

      <div className="px-5">
        <DayNavigator date={date} onDateChange={setDate} />
      </div>

      <main className="flex-1 px-5 pb-8 space-y-4 mt-1">
        {initialLoad ? (
          [1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl skeleton" />
                <div className="h-4 w-20 rounded-lg skeleton" />
                <div className="ml-auto h-5 w-14 rounded-full skeleton" />
              </div>
              <div className="h-16 rounded-2xl skeleton" />
            </div>
          ))
        ) : (
          [1, 2].map((liege, i) => (
            <div key={liege} className={`animate-fade-in ${loading ? 'opacity-60' : ''} transition-opacity`} style={{ animationDelay: `${i * 80}ms` }}>
              <LiegeCard
                liegeNumber={liege}
                bookings={loading ? [] : bookings}
                isToday={isToday}
                onSlotClick={handleSlotClick}
                onBookingClick={(booking) => setDeleteModal(booking)}
              />
            </div>
          ))
        )}
      </main>

      <footer className="text-center pb-6 pb-safe text-[11px] text-gray-400 font-medium tracking-wide">
        &copy; 2026 Weißmanns Liegenschaft GmbH &amp; Co. KG
      </footer>

      {bookingModal && (
        <BookingModal
          liege={bookingModal.liege}
          initialTime={bookingModal.time}
          error={bookingError}
          onBook={handleBook}
          onClose={() => {
            setBookingModal(null)
            setBookingError(null)
          }}
        />
      )}

      {deleteModal && (
        <DeleteConfirm
          booking={deleteModal}
          onDelete={handleDelete}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  )
}
