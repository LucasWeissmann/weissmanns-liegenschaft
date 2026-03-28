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

function isPast(date) {
  return toDateString(date) < toDateString(new Date())
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSlotClick = (liege, time) => {
    if (isPast(date)) {
      showToast('Buchungen in der Vergangenheit sind nicht möglich', 'error')
      return
    }
    setBookingError(null)
    setBookingModal({ liege, time })
  }

  const handleBook = async ({ liege, name, startTime, endTime }) => {
    if (isToday) {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hour12: false })
          .formatToParts(new Date()).map(p => [p.type, p.value])
      )
      const nowStr = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
      if (endTime <= nowStr) {
        setBookingError('Diese Zeit liegt in der Vergangenheit.')
        return
      }
    }

    if (hasOverlap(bookings, liege, startTime, endTime)) {
      setBookingError('Diese Zeit ist bereits belegt. Bitte wähle eine andere Zeit.')
      return
    }

    setBookingModal(null)
    setBookingError(null)
    showToast('Buchung erfolgreich!')
    createBooking({ liege, date: dateStr, startTime, endTime, name }).catch(() => {
      showToast('Fehler beim Speichern — bitte prüfe deine Verbindung', 'error')
    })
  }

  const handleDelete = async (bookingId) => {
    setDeleteModal(null)
    showToast('Buchung gelöscht')
    removeBooking(bookingId).catch(() => {
      showToast('Fehler beim Löschen — bitte prüfe deine Verbindung', 'error')
    })
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

      <div className="h-0.5 mx-6 rounded-full overflow-hidden">
        {loading && (
          <div className="h-full w-full bg-pool-100">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-pool-400 to-transparent animate-sync" />
          </div>
        )}
      </div>

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
          isToday={isToday}
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
