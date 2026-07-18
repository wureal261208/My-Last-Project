import admin from 'firebase-admin'

let initialized = false

/**
 * Initializes firebase-admin exactly once. Call this from anywhere that
 * needs Firestore/Auth Admin access (auth middleware, migration route,
 * the polling sync worker) - safe to call repeatedly.
 */
export function ensureFirebaseAdmin() {
  if (initialized || admin.apps.length) {
    initialized = true
    return admin
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT is not set. Paste the full service-account JSON (Firebase Console > ' +
        'Project settings > Service accounts > Generate new private key) as one line into server/.env.',
    )
  }

  const serviceAccount = JSON.parse(raw)
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  initialized = true
  return admin
}

export default admin
