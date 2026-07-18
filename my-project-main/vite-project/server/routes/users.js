import { Router } from 'express'
import User, { USER_ROLES } from '../models/User.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// POST /api/users/create
// Anyone signed in can create their own user record (e.g. right after signup).
// Only an admin may create a record with a role other than 'user' directly.
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { name, email, role, section } = req.body || {}
    if (!name || !email) return res.status(400).json({ error: 'name and email are required.' })

    const normalizedEmail = String(email).trim().toLowerCase()
    const requestedRole = USER_ROLES.includes(role) ? role : 'user'
    if (requestedRole !== 'user' && req.authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can create manager/employee/admin accounts.' })
    }

    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) return res.status(409).json({ error: 'A user with this email already exists.', user: existing })

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      role: requestedRole,
      section: requestedRole === 'employee' ? (section === 'rent' ? 'rent' : 'read') : null,
      firebaseUid: req.authUser.uid,
    })

    res.status(201).json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Could not create user.', detail: error.message })
  }
})

// PATCH /api/users/updateRole/:id  (admin only)
// Promotes/demotes a user between user, employee, manager, admin, and
// (for employees) assigns which Push Book shelf they manage.
router.patch('/updateRole/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { role, section } = req.body || {}
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${USER_ROLES.join(', ')}` })
    }

    const update = { role, section: role === 'employee' ? (section === 'rent' ? 'rent' : 'read') : null }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found.' })

    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Could not update role.', detail: error.message })
  }
})

// PATCH /api/users/:id/lock  (admin + manager)
router.patch('/:id/lock', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { locked } = req.body || {}
    const user = await User.findByIdAndUpdate(req.params.id, { locked: Boolean(locked) }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found.' })
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Could not update lock state.', detail: error.message })
  }
})

// GET /api/users/search?q=name-or-email  (admin + manager)
// Suggests existing accounts (synced from Firebase via /migrate/run) so a
// manager/admin can promote a real person instead of typing a brand new
// account from scratch.
router.get('/search', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ users: [] })

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(escaped, 'i')

    const users = await User.find({ $or: [{ name: pattern }, { email: pattern }] })
      .select({ name: 1, email: 1, role: 1, section: 1 })
      .limit(10)
      .lean()

    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: 'User search failed.', detail: error.message })
  }
})

// GET /api/users?role=employee  (admin + manager)
router.get('/', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const filter = {}
    if (req.query.role) filter.role = req.query.role
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500)
    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: 'Could not list users.', detail: error.message })
  }
})

export default router
