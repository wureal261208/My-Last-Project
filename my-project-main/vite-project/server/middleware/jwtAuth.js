import { verifyAccessToken } from '../utils/tokens.js'

/**
 * Verifies the `Authorization: Bearer <access token>` header issued by
 * /api/auth/login or /api/auth/refresh. Attaches req.authUser = { uid, email, role, section }.
 * This does not touch Firebase at all - it's the JWT-only replacement for
 * middleware/auth.js's requireAuth.
 */
export function requireJwtAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token.' })

    const payload = verifyAccessToken(token)
    req.authUser = { uid: payload.sub, email: payload.email, role: payload.role, section: payload.section || null }
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
