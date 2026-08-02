import admin, { ensureFirebaseAdmin } from '../firebaseAdmin.js'

const GLOBAL_DOC_PATH = ['bookwormData', 'global']

/**
 * Upserts or removes one member in Firestore's `bookwormData/global.staff`
 * array. This is the ONLY supported way to change that field now that the
 * Firestore rules reject direct client writes to it - every mutation must
 * go through a backend route (which authenticates + authorizes with
 * requireJwtAuth/requireRole first), and the Admin SDK used here bypasses
 * Firestore security rules entirely, which is safe precisely because this
 * code only runs after our own role checks have passed.
 *
 * Keeps the app's realtime UI (onSnapshot on bookwormData/global) in sync
 * without the frontend ever touching this field directly.
 */
export async function upsertFirestoreStaff(member) {
  try {
    ensureFirebaseAdmin()
  } catch (error) {
    console.warn('[firestoreStaffSync] Firebase Admin not configured, skipping mirror write:', error.message)
    return
  }

  const firestore = admin.firestore()
  const globalRef = firestore.collection(GLOBAL_DOC_PATH[0]).doc(GLOBAL_DOC_PATH[1])
  const email = String(member.email || '').toLowerCase()

  await firestore.runTransaction(async (tx) => {
    const snapshot = await tx.get(globalRef)
    const data = snapshot.exists ? snapshot.data() : {}
    const staff = Array.isArray(data.staff) ? data.staff : []
    const next = staff.filter((item) => (item?.email || '').toLowerCase() !== email)

    if (!member.removed) {
      next.unshift({
        id: member.id,
        name: member.name,
        email,
        role: member.role,
        section: member.section || null,
        updatedAt: new Date().toISOString(),
      })
    }

    tx.set(globalRef, { staff: next }, { merge: true })
  })
}

export async function removeFirestoreStaff(email) {
  return upsertFirestoreStaff({ email, removed: true })
}
