import { Router } from 'express'
import Book, { BOOK_USAGE_TYPES } from '../models/Book.js'
import { requireJwtAuth, requireRole } from '../middleware/jwtAuth.js'

const router = Router()

function serializeBook(doc) {
  // Normalizes the mixed-case Gutenberg-import fields and our own fields
  // into one consistent shape for the frontend.
  return {
    id: doc._id,
    title: doc.title || doc.Title || 'Untitled',
    author: doc.author || doc.Authors || 'Unknown author',
    cover: doc.cover || '',
    description: doc.description || '',
    usageType: doc.usageType || 'none',
    createdAt: doc.createdAt,
  }
}

// GET /api/books?q=title&usageType=read&page=1&limit=24 - PUBLIC
// Powers the Discover page. No login required - anyone browsing the site
// needs to see the catalog.
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.q) {
      const escaped = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(escaped, 'i')
      filter.$or = [{ title: pattern }, { Title: pattern }, { author: pattern }, { Authors: pattern }]
    }
    if (req.query.usageType) filter.usageType = req.query.usageType

    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Number(req.query.limit) || 24)

    const [docs, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Book.countDocuments(filter),
    ])

    res.json({ books: docs.map(serializeBook), total, page, pages: Math.ceil(total / limit) || 1 })
  } catch (error) {
    res.status(500).json({ error: 'Could not list books.', detail: error.message })
  }
})

// GET /api/books/catalog-search?q=title - staff only (admin/manager/employee)
// Internal tool: searches the raw imported Gutenberg catalog and returns
// pre-filled draft fields for the AdminDashboard "push book" form.
router.get('/catalog-search', requireJwtAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ books: [] })

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

// GET /api/books/:id - PUBLIC (Book Detail page)
router.get('/:id', async (req, res) => {
  try {
    const doc = await Book.findById(req.params.id).lean()
    if (!doc) return res.status(404).json({ error: 'Book not found.' })
    res.json({ book: serializeBook(doc) })
  } catch (error) {
    res.status(400).json({ error: 'Invalid book id.', detail: error.message })
  }
})

// POST /api/books - admin only - create a new book
router.post('/', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, author, cover, description, usageType } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title is required.' })
    if (usageType && !BOOK_USAGE_TYPES.includes(usageType)) {
      return res.status(400).json({ error: `usageType must be one of: ${BOOK_USAGE_TYPES.join(', ')}` })
    }

    const book = await Book.create({
      title: String(title).trim(),
      author: author || '',
      cover: cover || '',
      description: description || '',
      usageType: usageType || 'none',
      source: 'manual',
    })
    res.status(201).json({ book: serializeBook(book) })
  } catch (error) {
    res.status(500).json({ error: 'Could not create book.', detail: error.message })
  }
})

// POST /api/books/add - admin only - create or update by title (avoids duplicates).
// Kept for AdminDashboard's existing "push and tag" form.
router.post('/add', requireJwtAuth, requireRole('admin'), async (req, res) => {
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
      return res.json({ book: serializeBook(existing), created: false })
    }

    const book = await Book.create({
      title: String(title).trim(),
      author,
      cover,
      description,
      usageType: usageType || 'none',
      source: 'manual',
    })
    res.status(201).json({ book: serializeBook(book), created: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not save book.', detail: error.message })
  }
})

// PUT /api/books/:id - admin only - full update
router.put('/:id', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, author, cover, description, usageType } = req.body || {}
    if (usageType && !BOOK_USAGE_TYPES.includes(usageType)) {
      return res.status(400).json({ error: `usageType must be one of: ${BOOK_USAGE_TYPES.join(', ')}` })
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: { title, author, cover, description, usageType } },
      { new: true, runValidators: true },
    )
    if (!book) return res.status(404).json({ error: 'Book not found.' })
    res.json({ book: serializeBook(book) })
  } catch (error) {
    res.status(500).json({ error: 'Could not update book.', detail: error.message })
  }
})

// PATCH /api/books/:id/usage-type - admin only - quick tagging
router.patch('/:id/usage-type', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const { usageType } = req.body || {}
    if (!BOOK_USAGE_TYPES.includes(usageType)) {
      return res.status(400).json({ error: `usageType must be one of: ${BOOK_USAGE_TYPES.join(', ')}` })
    }

    const book = await Book.findByIdAndUpdate(req.params.id, { usageType }, { new: true })
    if (!book) return res.status(404).json({ error: 'Book not found.' })
    res.json({ book: serializeBook(book) })
  } catch (error) {
    res.status(500).json({ error: 'Could not tag book.', detail: error.message })
  }
})

// DELETE /api/books/:id - admin only
router.delete('/:id', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id)
    if (!book) return res.status(404).json({ error: 'Book not found.' })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not delete book.', detail: error.message })
  }
})

export default router
