import { Router } from 'express'
import Comment from '../models/Comment.js'
import { requireJwtAuth } from '../middleware/jwtAuth.js'

const router = Router()

function serializeComment(doc) {
  return {
    id: doc._id,
    bookId: doc.bookId,
    authorName: doc.authorName,
    text: doc.text,
    rating: doc.rating,
    createdAt: doc.createdAt,
    user: doc.user,
  }
}

// GET /api/comments?bookId=... - PUBLIC (Book Detail page shows reviews to everyone)
router.get('/', async (req, res) => {
  try {
    const { bookId } = req.query
    if (!bookId) return res.status(400).json({ error: 'bookId query param is required.' })

    const comments = await Comment.find({ bookId }).sort({ createdAt: -1 }).limit(100)
    res.json({ comments: comments.map(serializeComment) })
  } catch (error) {
    res.status(500).json({ error: 'Could not load comments.', detail: error.message })
  }
})

// POST /api/comments - any signed-in user
router.post('/', requireJwtAuth, async (req, res) => {
  try {
    const { bookId, text, rating } = req.body || {}
    if (!bookId || !text || !text.trim()) return res.status(400).json({ error: 'bookId and text are required.' })
    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'rating must be between 1 and 5.' })
    }

    const comment = await Comment.create({
      bookId,
      user: req.authUser.uid,
      authorName: req.authUser.email.split('@')[0],
      text: text.trim(),
      rating: rating ?? null,
    })

    res.status(201).json({ comment: serializeComment(comment) })
  } catch (error) {
    res.status(500).json({ error: 'Could not post comment.', detail: error.message })
  }
})

// DELETE /api/comments/:id - the comment's own author, or an admin
router.delete('/:id', requireJwtAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ error: 'Comment not found.' })

    const isOwner = String(comment.user) === String(req.authUser.uid)
    if (!isOwner && req.authUser.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments.' })
    }

    await comment.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not delete comment.', detail: error.message })
  }
})

export default router
