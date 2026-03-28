import { useState, useEffect } from 'react'
import DayNavigator from './components/DayNavigator'
import LiegeCard from './components/LiegeCard'
import BookingModal from './components/BookingModal'
import DeleteConfirm from './components/DeleteConfirm'
import Toast from './components/Toast'
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
  const [toast, setToast] = useState(null)

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

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

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
    showToast('Buchung erfolgreich!')
  }

  const handleDelete = async (bookingId) => {
    await removeBooking(bookingId)
    setDeleteModal(null)
    showToast('Buchung gelöscht')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="pt-safe px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="w-12 h-12 rounded-2xl shadow-lg shadow-pool-500/20" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Weißmanns Liegenschaft
            </h1>
            <p className="text-sm text-gray-500">
              Poolseite · Familie Weißmann
            </p>
          </div>
        </div>
      </header>

      <div className="px-6 mb-2">
        <DayNavigator date={date} onDateChange={setDate} />
      </div>

      <main className="flex-1 px-6 pb-8 space-y-4">
        {initialLoad ? (
          [1, 2].map((i) => (
            <div key={i} className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/60">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-20 rounded-full skeleton" />
                <div className="h-5 w-24 rounded-full skeleton" />
              </div>
              <div className="h-12 rounded-2xl skeleton" />
              <div className="flex justify-between mt-2 px-1">
                {[1, 2, 3].map((j) => <div key={j} className="h-3 w-8 rounded skeleton" />)}
              </div>
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
