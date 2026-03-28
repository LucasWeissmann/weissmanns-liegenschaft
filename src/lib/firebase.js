let _db = null
let _firebaseReady = null

function getDb() {
  if (_firebaseReady) return _firebaseReady
  _firebaseReady = import('./firebase-core.js').then(({ db }) => {
    _db = db
    return db
  })
  return _firebaseReady
}

export function subscribeToBookings(date, callback) {
  let unsubscribe = null
  let cancelled = false

  getDb().then(async (db) => {
    if (cancelled) return
    const { collection, query, where, onSnapshot } = await import('firebase/firestore')
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
  const db = await getDb()
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
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
  const db = await getDb()
  const { doc, deleteDoc } = await import('firebase/firestore')
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
