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

export { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp }
