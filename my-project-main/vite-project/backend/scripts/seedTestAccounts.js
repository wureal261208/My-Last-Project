// One-time (safe to re-run) script that provisions the 4 test actors this
// project needs for manual QA: Admin, Manager, Employee, and Customer.
// Creates/updates each account in:
//   - MongoDB (the role/permission source of truth)
//   - Firebase Auth (so they can actually log in through the Firebase app)
//   - Firestore bookwormData/global.staff (so the realtime UI shows them,
//     for the manager/employee accounts only - customers aren't "staff")
//
// Usage: node backend/scripts/seedTestAccounts.js
import '../loadEnv.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import admin, { ensureFirebaseAdmin } from '../firebaseAdmin.js'
import { upsertFirestoreStaff } from '../utils/firestoreStaffSync.js'

const SALT_ROUNDS = 12

// role here is the app-level role shown in the UI; mongoRole is what's
// actually stored on the User document (Mongo has no 'customer' value -
// customers are just role: 'user').
const TEST_ACCOUNTS = [
  { name: 'Admin Demo', email: 'admin@bookworm.test', password: 'Admin!2026Test', role: 'admin', mongoRole: 'admin', section: null },
  { name: 'Manager Demo', email: 'manager@bookworm.test', password: 'Manager!2026Test', role: 'manager', mongoRole: 'manager', section: null },
  { name: 'Employee Demo', email: 'employee@bookworm.test', password: 'Employee!2026Test', role: 'employee', mongoRole: 'employee', section: 'read' },
  { name: 'Customer Demo', email: 'customer@bookworm.test', password: 'Customer!2026Test', role: 'customer', mongoRole: 'user', section: null },
]

async function provisionFirebase(account) {
  ensureFirebaseAdmin()
  let firebaseUser
  try {
    firebaseUser = await admin.auth().getUserByEmail(account.email)
    await admin.auth().updateUser(firebaseUser.uid, { password: account.password, displayName: account.name })
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
    firebaseUser = await admin.auth().createUser({
      email: account.email,
      password: account.password,
      displayName: account.name,
      emailVerified: true,
    })
  }
  return firebaseUser.uid
}

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set - add it to backend/.env first.')
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'schema' })

  let firebaseAvailable = true
  try {
    ensureFirebaseAdmin()
  } catch (error) {
    firebaseAvailable = false
    console.warn('[seedTestAccounts] Firebase Admin not configured - Mongo accounts will be created, but nobody will be able to log in via Firebase until FIREBASE_SERVICE_ACCOUNT is set.')
  }

  const results = []

  for (const account of TEST_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS)
    let firebaseUid = null
    if (firebaseAvailable) {
      firebaseUid = await provisionFirebase(account)
    }

    const user = await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: account.name,
          role: account.mongoRole,
          section: account.section,
          passwordHash,
          firebaseUid,
          locked: false,
        },
      },
      { upsert: true, new: true },
    )

    if (['manager', 'employee'].includes(account.mongoRole)) {
      await upsertFirestoreStaff({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: account.mongoRole,
        section: user.section || null,
      }).catch((error) => console.warn(`[seedTestAccounts] Firestore mirror failed for ${account.email}:`, error.message))
    }

    results.push({ role: account.role, email: account.email, password: account.password })
  }

  console.log('\nTest accounts ready:\n')
  console.table(results)
  console.log('These same credentials work on both the Firebase app (/) and the Mongo demo app (/mongo-app) login forms.')

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('[seedTestAccounts] failed:', error)
  process.exit(1)
})
