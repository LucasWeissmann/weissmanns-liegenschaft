const _ready = import('./firebase-core.js')

// Pre-warm: start loading Firebase immediately on module import
_ready.catch(() => {})

export function subscribeToBookings(date, callback) {
  let unsubscribe = null
  let cancelled = false

  _ready.then(({ db, collection, query, where, onSnapshot }) => {
    if (cancelled) return
    const q = query(
      collection(db, 'bookings'),
      where('date', '==', date)
    )
    unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      callback(bookings)
    })
  })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

export async function createBooking({ liege, date, startTime, endTime, name }) {
  const { db, collection, addDoc, serverTimestamp } = await _ready
  return addDoc(collection(db, 'bookings'), {
    liege,
    date,
    startTime,
    endTime,
    name: name.trim(),
    createdAt: serverTimestamp(),
  })
}

export async function removeBooking(bookingId) {
  const { db, doc, deleteDoc } = await _ready
  return deleteDoc(doc(db, 'bookings', bookingId))
}

export function hasOverlap(existingBookings, liege, startTime, endTime) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const newStart = toMinutes(startTime)
  const newEnd = toMinutes(endTime)

  return existingBookings
    .filter((b) => b.liege === liege)
    .some((b) => {
      const bStart = toMinutes(b.startTime)
      const bEnd = toMinutes(b.endTime)
      return newStart < bEnd && newEnd > bStart
    })
}
