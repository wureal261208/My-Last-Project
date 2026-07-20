import { Router } from 'express'
import Rental from '../models/Rental.js'
import { requireJwtAuth, requireRole } from '../middleware/jwtAuth.js'

const router = Router()

function serializeRental(doc) {
  return {
    id: doc._id,
    user: doc.user,
    bookId: doc.bookId,
    bookTitle: doc.bookTitle,
    status: doc.status,
    recipientName: doc.recipientName,
    phone: doc.phone,
    address: doc.address,
    paymentMethod: doc.paymentMethod,
    note: doc.note,
    deliveryAt: doc.deliveryAt,
    expiresAt: doc.expiresAt,
    decidedAt: doc.decidedAt,
    decidedBy: doc.decidedBy,
    requestedAt: doc.createdAt,
  }
}

// POST /api/rentals - any signed-in user creates a rental order (COD checkout).
router.post('/', requireJwtAuth, async (req, res) => {
  try {
    const { bookId, bookTitle, recipientName, phone, address, note } = req.body || {}
    if (!bookId || !bookTitle) return res.status(400).json({ error: 'bookId and bookTitle are required.' })
    if (!recipientName || !phone || !address) {
      return res.status(400).json({ error: 'recipientName, phone, and address are required.' })
    }

    const alreadyPending = await Rental.findOne({ user: req.authUser.uid, bookId, status: 'pending' })
    if (alreadyPending) return res.status(409).json({ error: 'You already have a pending order for this book.' })

    const rental = await Rental.create({
      user: req.authUser.uid,
      bookId,
      bookTitle,
      recipientName,
      phone,
      address,
      note: note || '',
      paymentMethod: 'cod',
      status: 'pending',
    })

    res.status(201).json({ rental: serializeRental(rental) })
  } catch (error) {
    res.status(500).json({ error: 'Could not create rental order.', detail: error.message })
  }
})

// GET /api/rentals/mine - the signed-in user's own orders.
router.get('/mine', requireJwtAuth, async (req, res) => {
  try {
    await Rental.markExpiredPastDue()
    const rentals = await Rental.find({ user: req.authUser.uid }).sort({ createdAt: -1 })
    res.json({ rentals: rentals.map(serializeRental) })
  } catch (error) {
    res.status(500).json({ error: 'Could not load your orders.', detail: error.message })
  }
})

// GET /api/rentals?status=pending - admin/manager review queue.
router.get('/', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    await Rental.markExpiredPastDue()
    const filter = {}
    if (req.query.status) filter.status = req.query.status

    const rentals = await Rental.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'name email')
    res.json({ rentals: rentals.map(serializeRental) })
  } catch (error) {
    res.status(500).json({ error: 'Could not list rentals.', detail: error.message })
  }
})

// PATCH /api/rentals/:id/approve - admin/manager, sets the delivery date/time.
router.patch('/:id/approve', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { deliveryAt } = req.body || {}
    if (!deliveryAt) return res.status(400).json({ error: 'deliveryAt is required.' })

    const rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).json({ error: 'Rental not found.' })
    if (rental.status !== 'pending') return res.status(409).json({ error: `This order is already ${rental.status}.` })

    rental.approve(new Date(deliveryAt), req.authUser.email)
    await rental.save()
    res.json({ rental: serializeRental(rental) })
  } catch (error) {
    res.status(500).json({ error: 'Could not approve rental.', detail: error.message })
  }
})

// PATCH /api/rentals/:id/decline - admin/manager.
router.patch('/:id/decline', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).json({ error: 'Rental not found.' })
    if (rental.status !== 'pending') return res.status(409).json({ error: `This order is already ${rental.status}.` })

    rental.decline(req.authUser.email)
    await rental.save()
    res.json({ rental: serializeRental(rental) })
  } catch (error) {
    res.status(500).json({ error: 'Could not decline rental.', detail: error.message })
  }
})

// PATCH /api/rentals/:id/return - admin/manager marks a book as returned.
router.patch('/:id/return', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const rental = await Rental.findByIdAndUpdate(req.params.id, { status: 'returned' }, { new: true })
    if (!rental) return res.status(404).json({ error: 'Rental not found.' })
    res.json({ rental: serializeRental(rental) })
  } catch (error) {
    res.status(500).json({ error: 'Could not update rental.', detail: error.message })
  }
})

export default router
