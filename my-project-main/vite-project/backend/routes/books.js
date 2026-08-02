import { Router } from 'express'
import Book, { BOOK_USAGE_TYPES } from '../models/Book.js'
import { requireJwtAuth, requireRole } from '../middleware/jwtAuth.js'

const router = Router()

// Two very different kinds of documents live in the same MongoDB `books`
// collection:
//  - `source: 'gutenberg-import'` (or no `source` at all): ~75k bulk-imported
//    Project Gutenberg records, mixed-case fields (Title/Authors/...).
//  - `source: 'manual'`: books an Admin/Employee curated by hand through the
//    Admin dashboard (what used to live in Firestore's `managedBooks`
//    array). These carry a much richer shape - chapters, reader text,
//    status (draft/published), which shelf (`access`: read/rent) - that the
//    DetailPage/ReaderPage render directly, so we return them close to
//    as-is rather than flattening them down to the narrow catalog shape.
function serializeBook(doc) {
  if (doc.source === 'manual') {
    const { _id, __v, ...rest } = doc
    return { ...rest, id: String(_id) }
  }

  const gutenbergId = doc['Etext Number']
  return {
    id: doc._id,
    title: doc.title || doc.Title || 'Untitled',
    author: doc.author || doc.Authors || 'Unknown author',
    cover: doc.cover || (gutenbergId ? `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg` : ''),
    description: doc.description || '',
    category: String(doc.Bookshelves || '').split(';')[0]?.trim() || undefined,
    readerUrl: doc.readerUrl || (gutenbergId ? `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm` : ''),
    usageType: doc.usageType || 'none',
    createdAt: doc.createdAt,
  }
}

// An employee only manages the one shelf (read/rent) they were assigned to
// (User.section) - mirrors the client-side restriction in AdminPage, but
<<<<<<< HEAD
// enforced here since that's the only place it actually matters. Admin and
// Manager are unrestricted (either shelf).
=======
// enforced here since that's the only place it actually matters.
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
function assertBookAccessAllowed(req, res, access) {
  if (req.authUser.role !== 'employee') return true
  if (access === req.authUser.section) return true
  res.status(403).json({ error: `You can only manage books on your assigned shelf (${req.authUser.section}).` })
  return false
}

<<<<<<< HEAD
// Only an admin can publish (or hide) a book. Manager/Employee submissions
// always land as 'draft' and wait for an admin to approve them via
// PATCH /:id/approve - this holds even if a non-admin client sends a
// different status directly to the API, bypassing the UI.
function resolveBookStatus(req, requestedStatus, fallback) {
  if (req.authUser.role === 'admin') {
    return ['draft', 'published', 'hidden'].includes(requestedStatus) ? requestedStatus : (fallback || 'draft')
  }
  return fallback === 'published' ? 'published' : 'draft'
}

=======
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
// GET /api/books?q=title&usageType=read&page=1&limit=24 - PUBLIC
// Powers the Discover page and the Main site catalog. Draft books (manual,
// unpublished) never show up here - only /mine (staff-only) sees those.
router.get('/', async (req, res) => {
  try {
    const filter = { $and: [{ $or: [{ source: { $ne: 'manual' } }, { status: { $ne: 'draft' } }] }] }
    if (req.query.q) {
      const escaped = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(escaped, 'i')
      filter.$and.push({ $or: [{ title: pattern }, { Title: pattern }, { author: pattern }, { Authors: pattern }] })
    }
    if (req.query.usageType) filter.$and.push({ usageType: req.query.usageType })

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

// GET /api/books/mine?access=read - admin + employee (manager doesn't push
// books - see AdminPage's canPushBooks). Lists every hand-curated book
// (draft or published) so the Admin dashboard's "manage books" table can
// show/edit its own catalog, independent of the 75k imported records.
router.get('/mine', requireJwtAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
  try {
    const filter = { source: 'manual' }
    if (req.authUser.role === 'employee') filter.access = req.authUser.section
    else if (req.query.access) filter.access = req.query.access

    const docs = await Book.find(filter).sort({ createdAt: -1 }).limit(500).lean()
    res.json({ books: docs.map(serializeBook) })
  } catch (error) {
    res.status(500).json({ error: 'Could not list your books.', detail: error.message })
  }
})

<<<<<<< HEAD
// GET /api/books/pending - admin only - drafts submitted by Manager/Employee
// waiting for approval before they can appear on the main site.
router.get('/pending', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const docs = await Book.find({ source: 'manual', status: 'draft' }).sort({ createdAt: -1 }).limit(200).lean()
    res.json({ books: docs.map(serializeBook) })
  } catch (error) {
    res.status(500).json({ error: 'Could not list pending books.', detail: error.message })
  }
})

=======
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
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

// POST /api/books - admin + employee (employee restricted to their shelf)
// Accepts the full hand-curated book record (title, chapters, status,
// access, etc.) built by the Admin dashboard's "push book" form.
<<<<<<< HEAD
router.post('/', requireJwtAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
  try {
    const { title, access, status } = req.body || {}
=======
router.post('/', requireJwtAuth, requireRole('admin', 'employee'), async (req, res) => {
  try {
    const { title, access } = req.body || {}
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
    if (!title) return res.status(400).json({ error: 'title is required.' })
    if (!assertBookAccessAllowed(req, res, access === 'rent' ? 'rent' : 'read')) return

    const book = await Book.create({
      ...req.body,
      title: String(title).trim(),
      access: access === 'rent' ? 'rent' : 'read',
<<<<<<< HEAD
      status: resolveBookStatus(req, status, 'draft'),
=======
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
      source: 'manual',
    })
    res.status(201).json({ book: serializeBook(book.toObject()) })
  } catch (error) {
    res.status(500).json({ error: 'Could not create book.', detail: error.message })
  }
})

// POST /api/books/add - admin only - create or update by title (avoids duplicates).
// Kept for the simple Gutenberg "push and tag" flow (separate from /mine).
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
      return res.json({ book: serializeBook(existing.toObject()), created: false })
    }

    const book = await Book.create({
      title: String(title).trim(),
      author,
      cover,
      description,
      usageType: usageType || 'none',
      source: 'manual',
    })
    res.status(201).json({ book: serializeBook(book.toObject()), created: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not save book.', detail: error.message })
  }
})

// PUT /api/books/:id - admin + employee (employee restricted to their shelf)
<<<<<<< HEAD
router.put('/:id', requireJwtAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
=======
router.put('/:id', requireJwtAuth, requireRole('admin', 'employee'), async (req, res) => {
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
  try {
    const existing = await Book.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Book not found.' })
    if (existing.source === 'manual' && !assertBookAccessAllowed(req, res, existing.access)) return

    const nextAccess = req.body?.access === 'rent' ? 'rent' : req.body?.access === 'read' ? 'read' : existing.access
    if (nextAccess !== existing.access && !assertBookAccessAllowed(req, res, nextAccess)) return

<<<<<<< HEAD
    const nextStatus = resolveBookStatus(req, req.body?.status, existing.status)
    Object.assign(existing, req.body, { source: 'manual', access: nextAccess, status: nextStatus })
=======
    Object.assign(existing, req.body, { source: 'manual', access: nextAccess })
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
    await existing.save()
    res.json({ book: serializeBook(existing.toObject()) })
  } catch (error) {
    res.status(500).json({ error: 'Could not update book.', detail: error.message })
  }
})

// PATCH /api/books/:id/approve - admin only - publish a Manager/Employee's
// draft submission.
router.patch('/:id/approve', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { status: 'published' }, { new: true })
    if (!book) return res.status(404).json({ error: 'Book not found.' })
    res.json({ book: serializeBook(book.toObject()) })
  } catch (error) {
    res.status(500).json({ error: 'Could not approve book.', detail: error.message })
  }
})

// PATCH /api/books/:id/reject - admin only - decline a draft submission
// (removes it, since it was never live).
router.patch('/:id/reject', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ error: 'Book not found.' })
    if (book.status !== 'draft') return res.status(400).json({ error: 'Only draft books can be rejected - this one is already published.' })

    await book.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not reject book.', detail: error.message })
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
    res.json({ book: serializeBook(book.toObject()) })
  } catch (error) {
    res.status(500).json({ error: 'Could not tag book.', detail: error.message })
  }
})

// DELETE /api/books/:id - admin + employee (employee restricted to their shelf)
<<<<<<< HEAD
router.delete('/:id', requireJwtAuth, requireRole('admin', 'manager', 'employee'), async (req, res) => {
=======
router.delete('/:id', requireJwtAuth, requireRole('admin', 'employee'), async (req, res) => {
>>>>>>> 1d4f13e8535ca0235fae345ff0129c35aa1759b9
  try {
    const existing = await Book.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Book not found.' })
    if (existing.source === 'manual' && !assertBookAccessAllowed(req, res, existing.access)) return

    await existing.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not delete book.', detail: error.message })
  }
})

export default router
