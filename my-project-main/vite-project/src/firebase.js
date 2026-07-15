import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, initializeAuth, inMemoryPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyD8m1E4x85Dow3D1PtiUpfa22N4_S1GU9w',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'the-final-book-project.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'the-final-book-project',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'the-final-book-project.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1067209935892',
  appId: env.VITE_FIREBASE_APP_ID || '1:1067209935892:web:b768e2d3aa75fa42056b01',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EH58XY55XL',
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

function createAuth() {
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence })
  } catch {
    const existingAuth = getAuth(app)
    setPersistence(existingAuth, inMemoryPersistence).catch(() => {})
    return existingAuth
  }
}

export const auth = createAuth()
export const db = getFirestore(app)

isSupported().then((supported) => {
  if (supported) getAnalytics(app)
})
