import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD4Y9oMOaYViwJ2y0mkJok7vGlIVGtjZ1E',
  authDomain: 'weissmanns-liegenschaft.firebaseapp.com',
  projectId: 'weissmanns-liegenschaft',
  storageBucket: 'weissmanns-liegenschaft.firebasestorage.app',
  messagingSenderId: '590020533222',
  appId: '1:590020533222:web:bfd8d048f085f42a479427',
}

const app = initializeApp(firebaseConfig)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

const BOOKINGS_COLLECTION = 'bookings'

export function subscribeToBookings(date, callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('date', '==', date)
  )

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    callback(bookings)
  })
}

export async function createBooking({ liege, date, startTime, endTime, name }) {
  return addDoc(collection(db, BOOKINGS_COLLECTION), {
    liege,
    date,
    startTime,
    endTime,
    name: name.trim(),
    createdAt: serverTimestamp(),
  })
}

export async function removeBooking(bookingId) {
  return deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId))
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
