import admin from 'firebase-admin'
import User from '../models/User.js'

const GLOBAL_DOC_PATH = ['bookwormData', 'global']

/**
 * Keeps Firestore's `staff` array (the actual source of truth the live
 * site checks for Manager/Employee permissions) and MongoDB's `users`
 * collection (role field) in sync, in both directions:
 *
 *  - Promote someone in AdminDashboard (writes to Firestore) -> shows up
 *    in Mongo within one tick.
 *  - Update someone's role directly in MongoDB / via PATCH /users/updateRole
 *    -> shows up on the live site (Firestore) within one tick, without
 *    anyone needing to re-save anything in the app.
 *
 * Conflict rule: whichever side has the newer `updatedAt` wins. Records
 * missing `updatedAt` (older data) are treated as needing a sync once.
 *
 * This intentionally only syncs staff/role data for now - book catalog
 * sync stays one-way (Catalog Sync tab), and rental orders stay
 * Firestore-only, by design (see project notes).
 */
export function startPollingSync({ intervalMs = 15000 } = {}) {
  if (!admin.apps.length) {
    console.warn('[sync] Firebase Admin is not initialized - polling sync disabled. Set FIREBASE_SERVICE_ACCOUNT in server/.env.')
    return () => {}
  }

  let running = false
  const timer = setInterval(() => {
    if (running) return // skip overlapping ticks if one is still in flight
    running = true
    runSyncTick()
      .catch((error) => console.error('[sync] tick failed:', error.message))
      .finally(() => {
        running = false
      })
  }, intervalMs)

  console.log(`[sync] polling sync started - checking Firestore <-> MongoDB every ${intervalMs / 1000}s`)
  return () => clearInterval(timer)
}

async function runSyncTick() {
  const firestore = admin.firestore()
  const globalRef = firestore.collection(GLOBAL_DOC_PATH[0]).doc(GLOBAL_DOC_PATH[1])
  const snapshot = await globalRef.get()
  const data = snapshot.exists ? snapshot.data() : {}
  const staff = Array.isArray(data.staff) ? data.staff : []

  const { nextStaff, changed } = await syncStaff(staff)
  if (changed) {
    await globalRef.set({ staff: nextStaff }, { merge: true })
    console.log(`[sync] staff array updated (${nextStaff.length} accounts)`)
  }
}

async function syncStaff(staff) {
  const byEmail = new Map(staff.filter((item) => item?.email).map((item) => [item.email.toLowerCase(), item]))
  const mongoStaffUsers = await User.find({ role: { $in: ['manager', 'employee'] } }).lean()
  let changed = false

  // MongoDB -> Firestore: pull in promotions/edits made directly in Mongo.
  for (const mongoUser of mongoStaffUsers) {
    const email = mongoUser.email.toLowerCase()
    const existing = byEmail.get(email)
    const mongoUpdatedAt = mongoUser.updatedAt ? new Date(mongoUser.updatedAt).getTime() : 0
    const fsUpdatedAt = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : 0

    if (!existing || mongoUpdatedAt > fsUpdatedAt) {
      byEmail.set(email, {
        id: existing?.id || String(mongoUser._id),
        name: mongoUser.name,
        email,
        role: mongoUser.role,
        section: mongoUser.role === 'employee' ? (mongoUser.section === 'rent' ? 'rent' : 'read') : null,
        updatedAt: mongoUser.updatedAt || new Date().toISOString(),
      })
      changed = true
    }
  }

  // Firestore -> MongoDB: push local promotions/edits back out to Mongo.
  const mongoByEmail = new Map(mongoStaffUsers.map((item) => [item.email.toLowerCase(), item]))
  for (const member of byEmail.values()) {
    const mongoUser = mongoByEmail.get(member.email)
    const fsUpdatedAt = member.updatedAt ? new Date(member.updatedAt).getTime() : 0
    const mongoUpdatedAt = mongoUser?.updatedAt ? new Date(mongoUser.updatedAt).getTime() : 0

    if (!mongoUser || fsUpdatedAt > mongoUpdatedAt) {
      await User.findOneAndUpdate(
        { email: member.email },
        { $set: { name: member.name, role: member.role, section: member.section || null } },
        { upsert: true },
      )
    }
  }

  // A staff member removed from Firestore (via "Remove" in AdminDashboard)
  // should also stop being manager/employee in Mongo.
  for (const mongoUser of mongoStaffUsers) {
    const email = mongoUser.email.toLowerCase()
    if (!byEmail.has(email)) {
      await User.findOneAndUpdate({ email }, { $set: { role: 'user', section: null } })
    }
  }

  return { nextStaff: Array.from(byEmail.values()), changed }
}
