import { Router } from 'express'
import Book, { BOOK_USAGE_TYPES } from '../models/Book.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// POST /api/books/add  (admin only)
// Adds a new book, or updates the existing one if a book with the same
// title (case-insensitive) already exists - this is how AdminDashboard's
// "push and tag" form avoids creating duplicates.
router.post('/add', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, author, cover, description, usageType } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title is required.' })
    if (usageType && !BOOK_USAGE_TYPES.includes(usageType)) {
      return res.status(400).json({ error: `usageType must be one of: ${BOOK_USAGE_TYPES.join(', ')}` })
    }

    const existing = await Book.findByTitle(title)
    if (existing) {
      if (author !== undefined) existing.author = author
      if (cover !== undefined) existing.cover = cover
      if (description !== undefined) existing.description = description
      if (usageType !== undefined) existing.usageType = usageType
      await existing.save()
      return res.json({ book: existing, created: false })
    }

    const book = await Book.create({
      title: String(title).trim(),
      author,
      cover,
      description,
      usageType: usageType || 'none',
      source: 'manual',
    })
    res.status(201).json({ book, created: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not save book.', detail: error.message })
  }
})

// PATCH /api/books/:id/usage-type  (admin only)
// Quick tagging endpoint for books that were imported without a usageType yet.
router.patch('/:id/usage-type', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { usageType } = req.body || {}
    if (!BOOK_USAGE_TYPES.includes(usageType)) {
      return res.status(400).json({ error: `usageType must be one of: ${BOOK_USAGE_TYPES.join(', ')}` })
    }

    const book = await Book.findByIdAndUpdate(req.params.id, { usageType }, { new: true })
    if (!book) return res.status(404).json({ error: 'Book not found.' })
    res.json({ book })
  } catch (error) {
    res.status(500).json({ error: 'Could not tag book.', detail: error.message })
  }
})

// GET /api/books?q=title&usageType=none  (any signed-in staff)
router.get('/', requireAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
  try {
    const filter = {}
    if (req.query.q) {
      const escaped = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [{ title: new RegExp(escaped, 'i') }, { Title: new RegExp(escaped, 'i') }]
    }
    if (req.query.usageType) filter.usageType = req.query.usageType

    const books = await Book.find(filter).sort({ createdAt: -1 }).limit(200)
    res.json({ books })
  } catch (error) {
    res.status(500).json({ error: 'Could not list books.', detail: error.message })
  }
})

export default router
