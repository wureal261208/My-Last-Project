import '../loadEnv.js'
import mongoose from 'mongoose'
import Book from '../models/Book.js'

// One-time cleanup: removes the old hardcoded sample books that
// backend/scripts/seedBooks.js used to insert (Pride and Prejudice,
// Frankenstein, etc.) so only the real Project Gutenberg CSV import
// (~75k docs, no `source` field or source: 'gutenberg-import') and any
// admin-approved manual submissions (`source: 'manual'`) remain.
//
// Safe by construction: only documents with source === 'seed' are ever
// touched here - that value is set exclusively by seedBooks.js.
async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set - add it to backend/.env first.')

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'schema' })
  console.log('[cleanup] connected to MongoDB')

  const result = await Book.deleteMany({ source: 'seed' })
  console.log(`[cleanup] removed ${result.deletedCount} old sample book(s) with source: 'seed'`)

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('[cleanup] failed:', error)
  process.exit(1)
})
