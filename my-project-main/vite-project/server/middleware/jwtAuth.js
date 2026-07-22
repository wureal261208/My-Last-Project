import { verifyAccessToken } from '../utils/tokens.js'
import admin, { ensureFirebaseAdmin } from '../firebaseAdmin.js'
import User from '../models/User.js'

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Verifies the `Authorization: Bearer <token>` header, accepting EITHER:
 *  - our own JWT (issued by /api/auth/login - used by the new /mongo-app), or
 *  - a Firebase ID token (used by the original Firebase-authenticated app,
 *    e.g. AdminDashboard's Catalog Sync / Users search).
 *
 * This lets both auth systems share the same Mongo-backed API routes while
 * the project is transitioning off Firebase Auth.
 */
export async function requireJwtAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token.' })

  // Try our own JWT first - synchronous and fast, no network call.
  try {
    const payload = verifyAccessToken(token)
    req.authUser = { uid: payload.sub, email: payload.email, role: payload.role, section: payload.section || null }
    return next()
  } catch {
    // Not one of our tokens (or expired) - fall through to Firebase.
  }

  try {
    ensureFirebaseAdmin()
    const decoded = await admin.auth().verifyIdToken(token)
    const email = (decoded.email || '').toLowerCase()

    let role = 'user'
    if (adminEmails.includes(email)) {
      role = 'admin'
    } else {
      const dbUser = await User.findOne({ email })
      if (dbUser?.locked) return res.status(403).json({ error: 'This account has been locked.' })
      if (dbUser?.role) role = dbUser.role
    }

    req.authUser = { uid: decoded.uid, email, role }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session.', detail: error.message })
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.authUser) return res.status(401).json({ error: 'Not authenticated.' })
    if (!allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({ error: `Requires one of: ${allowedRoles.join(', ')}.` })
    }
    next()
  }
}
