import { Router } from 'express'
import admin from '../firebaseAdmin.js'
import { isMongoConnected } from '../db.js'
import User from '../models/User.js'
import Book from '../models/Book.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/migrate/status
// Tells the AdminDashboard which data source is currently usable, so the
// UI can decide: "Mongo is ready, use it directly" vs "Mongo is empty,
// offer to migrate from Firebase first".
router.get('/status', requireAuth, requireRole('admin'), async (req, res) => {
  const mongoConnected = isMongoConnected()
  const [bookCount, userCount] = mongoConnected
    ? await Promise.all([Book.countDocuments(), User.countDocuments()])
    : [0, 0]

  res.json({
    mongoConnected,
    mongoHasData: bookCount > 0 || userCount > 0,
    counts: { books: bookCount, users: userCount },
    recommendation: !mongoConnected
      ? 'mongo-unavailable'
      : bookCount === 0 && userCount === 0
        ? 'run-migration'
        : 'use-mongo-directly',
  })
})

// POST /api/migrate/run  (admin only)
// Reads BookWorm's Firestore data with the Firebase Admin SDK and upserts
// it into MongoDB. Safe to re-run: existing documents are matched by email
// (users) or title (books) instead of being duplicated.
router.post('/run', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(500).json({
        error: 'Firebase Admin is not initialized. Set FIREBASE_SERVICE_ACCOUNT in server/.env first.',
      })
    }

    const firestore = admin.firestore()
    const summary = { usersUpserted: 0, booksUpserted: 0, errors: [] }

    const globalSnap = await firestore.doc('bookwormData/global').get()
    const globalData = globalSnap.exists ? globalSnap.data() : {}

    const staff = Array.isArray(globalData.staff) ? globalData.staff : []
    const knownUsers = Array.isArray(globalData.knownUsers) ? globalData.knownUsers : []
    const managedBooks = Array.isArray(globalData.managedBooks) ? globalData.managedBooks : []

    // Staff carries the real role (manager/employee); knownUsers only ever
    // holds customer-facing accounts, so anyone not already in `staff`
    // migrates in as role 'user'.
    const staffByEmail = new Map(staff.map((item) => [String(item.email || '').toLowerCase(), item]))
    const allPeople = [
      ...staff,
      ...knownUsers.filter((item) => !staffByEmail.has(String(item.email || '').toLowerCase())),
    ]

    for (const person of allPeople) {
      try {
        const email = String(person.email || '').trim().toLowerCase()
        if (!email) continue

        const role = ['manager', 'employee', 'admin'].includes(person.role) ? person.role : 'user'
        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              name: person.name || email,
              role,
              section: role === 'employee' ? (person.section === 'rent' ? 'rent' : 'read') : null,
              locked: Boolean(person.locked),
            },
            $setOnInsert: { email },
          },
          { upsert: true },
        )
        summary.usersUpserted += 1
      } catch (error) {
        summary.errors.push(`user ${person.email}: ${error.message}`)
      }
    }

    for (const book of managedBooks) {
      try {
        if (!book.title) continue
        await Book.findOneAndUpdate(
          { title: new RegExp(`^${String(book.title).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          {
            $set: {
              title: book.title,
              author: book.author || '',
              cover: book.formats?.['image/jpeg'] || book.cover || '',
              description: book.description || '',
              usageType: book.access === 'rent' ? 'rent' : 'read',
              source: 'firebase-migration',
            },
          },
          { upsert: true },
        )
        summary.booksUpserted += 1
      } catch (error) {
        summary.errors.push(`book ${book.title}: ${error.message}`)
      }
    }

    res.json({ ok: true, summary })
  } catch (error) {
    res.status(500).json({ error: 'Migration failed.', detail: error.message })
  }
})

export default router
