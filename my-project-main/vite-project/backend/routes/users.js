import { Router } from 'express'
import User, { USER_ROLES } from '../models/User.js'
import { requireJwtAuth, requireRole } from '../middleware/jwtAuth.js'
import { maskEmail } from '../utils/mask.js'
import { upsertFirestoreStaff, removeFirestoreStaff } from '../utils/firestoreStaffSync.js'
import { generateTemporaryPassword } from '../utils/randomPassword.js'
import admin, { ensureFirebaseAdmin } from '../firebaseAdmin.js'

// Creates the matching Firebase Auth account for a brand-new staff member,
// with a random one-time password (replacing the old hardcoded shared
// 'Admin123' password). Returns the password so the caller (an
// admin/manager) can hand it to the new hire directly; returns null if a
// Firebase account for that email already exists (nothing to share) or if
// Firebase Admin isn't configured in this environment.
async function provisionFirebaseAccount(email, name) {
  try {
    ensureFirebaseAdmin()
  } catch (error) {
    console.warn('[users] Firebase Admin not configured, skipping Auth account creation:', error.message)
    return null
  }

  try {
    await admin.auth().getUserByEmail(email)
    return null // already has a Firebase account - nothing to provision
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      console.warn('[users] Could not check existing Firebase account:', error.message)
      return null
    }
  }

  const temporaryPassword = generateTemporaryPassword()
  try {
    await admin.auth().createUser({ email, password: temporaryPassword, displayName: name })
    return temporaryPassword
  } catch (error) {
    console.warn('[users] Could not create Firebase account:', error.message)
    return null
  }
}

const router = Router()

function toStaffMirror(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    section: user.section || null,
  }
}

// Fire-and-forget mirror into Firestore so the realtime UI (onSnapshot on
// bookwormData/global) updates without the frontend writing that field
// itself. Never blocks or fails the HTTP response - Mongo stays the source
// of truth for auth/role even if this mirror write has a hiccup.
function mirrorStaff(user) {
  if (!['manager', 'employee'].includes(user.role)) {
    return removeFirestoreStaff(user.email).catch((error) => console.warn('[users] Firestore mirror (remove) failed:', error.message))
  }
  return upsertFirestoreStaff(toStaffMirror(user)).catch((error) => console.warn('[users] Firestore mirror (upsert) failed:', error.message))
}

// GET /api/users/me - resolves the caller's own role from Mongo (the
// verified source of truth), so the frontend never has to trust
// client-readable Firestore data to decide what an Admin/Manager/Employee
// is allowed to see or do.
router.get('/me', requireJwtAuth, (req, res) => {
  res.json({ user: { uid: req.authUser.uid, email: req.authUser.email, role: req.authUser.role, section: req.authUser.section || null } })
})

// POST /api/users/create
// Anyone signed in can create their own user record (e.g. right after signup).
// Only an admin may create a record with a role other than 'user' directly.
router.post('/create', requireJwtAuth, async (req, res) => {
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
    })

    mirrorStaff(user)
    res.status(201).json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Could not create user.', detail: error.message })
  }
})

// PATCH /api/users/updateRole/:id  (admin only)
// Promotes/demotes a user between user, employee, manager, admin, and
// (for employees) assigns which Push Book shelf they manage.
router.patch('/updateRole/:id', requireJwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const { role, section } = req.body || {}
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${USER_ROLES.join(', ')}` })
    }

    const update = { role, section: role === 'employee' ? (section === 'rent' ? 'rent' : 'read') : null }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found.' })

    mirrorStaff(user)
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Could not update role.', detail: error.message })
  }
})

// DELETE /api/users/:id  (admin + manager)
// Removes a Manager, Employee, or Customer account. A Manager may remove an
// Employee or a Customer, but NEVER another Manager - only an Admin can do
// that. This is enforced here on the server; the UI hiding the button for
// Managers is only a convenience, not the actual security boundary.
router.delete('/:id', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ error: 'User not found.' })

    if (String(target._id) === String(req.authUser.uid)) {
      return res.status(400).json({ error: 'You cannot remove your own account.' })
    }
    if (target.role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be removed this way.' })
    }
    if (target.role === 'manager' && req.authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can remove a manager account.' })
    }

    await User.findByIdAndDelete(req.params.id)
    if (['manager', 'employee'].includes(target.role)) {
      removeFirestoreStaff(target.email).catch((error) => console.warn('[users] Firestore mirror (remove) failed:', error.message))
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Could not remove user.', detail: error.message })
  }
})

// PATCH /api/users/:id/lock  (admin + manager)
router.patch('/:id/lock', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { locked } = req.body || {}
    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ error: 'User not found.' })
    if (target.role === 'manager' && req.authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can lock/unlock a manager account.' })
    }

    target.locked = Boolean(locked)
    await target.save()
    res.json({ user: target })
  } catch (error) {
    res.status(500).json({ error: 'Could not update lock state.', detail: error.message })
  }
})

// PATCH /api/users/upsert-by-email  (admin + manager)
// Called right when AdminDashboard creates/edits a staff member, so MongoDB
// reflects the change immediately (this route now ALSO mirrors into
// Firestore itself, so the frontend no longer needs to write bookwormData
// staff directly).
router.patch('/upsert-by-email', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, email, role, section } = req.body || {}
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!normalizedEmail || !USER_ROLES.includes(role)) {
      return res.status(400).json({ error: `email is required and role must be one of: ${USER_ROLES.join(', ')}` })
    }
    if (role === 'manager' && req.authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can create manager accounts.' })
    }

    const existing = await User.findOne({ email: normalizedEmail })
    if (existing?.role === 'manager' && role !== 'manager' && req.authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can change a manager account.' })
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: name || normalizedEmail,
          role,
          section: role === 'employee' ? (section === 'rent' ? 'rent' : 'read') : null,
        },
      },
      { upsert: true, new: true },
    )

    mirrorStaff(user)

    // Brand-new manager/employee: also provision their Firebase Auth login
    // with a fresh random password, since there is no more shared default.
    let temporaryPassword = null
    if (!existing && ['manager', 'employee'].includes(role)) {
      temporaryPassword = await provisionFirebaseAccount(normalizedEmail, user.name)
    }

    res.json({ user, temporaryPassword })
  } catch (error) {
    res.status(500).json({ error: 'Could not sync user to MongoDB.', detail: error.message })
  }
})

// GET /api/users/search?q=name-or-email  (admin + manager)
// Suggests existing accounts (synced from Firebase via /migrate/run) so a
// manager/admin can promote a real person instead of typing a brand new
// account from scratch. Emails are masked - this is a browse/lookup view
// over accounts the caller doesn't necessarily own.
router.get('/search', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ users: [] })

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(escaped, 'i')

    const users = await User.find({ $or: [{ name: pattern }, { email: pattern }] })
      .select({ name: 1, email: 1, role: 1, section: 1 })
      .limit(10)
      .lean()

    res.json({ users: users.map((user) => ({ ...user, email: maskEmail(user.email) })) })
  } catch (error) {
    res.status(500).json({ error: 'User search failed.', detail: error.message })
  }
})

// GET /api/users?role=employee  (admin + manager) - emails masked, same
// reasoning as /search.
router.get('/', requireJwtAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const filter = {}
    if (req.query.role) filter.role = req.query.role
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500).lean()
    res.json({ users: users.map((user) => ({ ...user, email: maskEmail(user.email) })) })
  } catch (error) {
    res.status(500).json({ error: 'Could not list users.', detail: error.message })
  }
})

export default router
