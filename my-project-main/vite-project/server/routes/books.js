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

// GET /api/books/catalog-search?q=title  (admin, manager, employee)
// Searches the raw imported Gutenberg catalog (Title/Authors/Bookshelves/...)
// and returns pre-filled draft fields the client can drop straight into the
// Push Book form - this is what makes "pushing" a book fast instead of
// typing every field by hand.
router.get('/catalog-search', requireAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ books: [] })

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Prefix match on purpose: with 75k+ documents, an anchored regex can
    // use an index on Title efficiently, while a "contains" search cannot.
    const prefixPattern = new RegExp(`^${escaped}`, 'i')

    const docs = await Book.find({ $or: [{ Title: prefixPattern }, { title: prefixPattern }] })
      .select({ Title: 1, title: 1, Authors: 1, author: 1, Bookshelves: 1, Subjects: 1, Language: 1, 'Etext Number': 1, usageType: 1, rights: 1 })
      .limit(20)
      .lean()

    const books = docs.map((doc) => {
      const gutenbergId = doc['Etext Number']
      const title = doc.Title || doc.title || 'Untitled'
      const author = doc.Authors || doc.author || 'Unknown author'
      const bookshelves = String(doc.Bookshelves || '').split(';').map((item) => item.trim()).filter(Boolean)
      const subjects = String(doc.Subjects || '')
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6)

      return {
        _id: doc._id,
        gutenbergId,
        title,
        author,
        category: bookshelves[0] || subjects[0] || 'Classic',
        subjects,
        language: doc.Language || 'en',
        usageType: doc.usageType || 'none',
        description: `A public-domain title by ${author}, hosted on Project Gutenberg.${
          subjects.length ? ` Subjects: ${subjects.slice(0, 3).join(', ')}.` : ''
        }${doc.rights ? ` ${doc.rights}` : ''}`,
        cover: gutenbergId ? `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg` : '',
        readerUrl: gutenbergId ? `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm` : '',
        plainTextUrl: gutenbergId ? `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt` : '',
      }
    })

    res.json({ books })
  } catch (error) {
    res.status(500).json({ error: 'Catalog search failed.', detail: error.message })
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
