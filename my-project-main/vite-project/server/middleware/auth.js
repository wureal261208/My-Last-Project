import admin, { ensureFirebaseAdmin } from '../firebaseAdmin.js'
import User from '../models/User.js'

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Verifies the `Authorization: Bearer <Firebase ID token>` header, then
 * resolves the caller's role: hardcoded ADMIN_EMAILS win first, otherwise
 * whatever role is stored on the matching MongoDB User document (defaults
 * to 'user' if the caller has never been synced into Mongo yet).
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token.' })

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
