import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signAccessToken, verifyAccessToken } from '../utils/tokens.js'

const router = Router()
const SALT_ROUNDS = 12

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, section: user.section || null }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password are required.' })
    if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, role: 'user', passwordHash })

    const accessToken = signAccessToken(user)
    res.status(201).json({ user: publicUser(user), accessToken })
  } catch (error) {
    res.status(500).json({ error: 'Could not register.', detail: error.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password are required.' })

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password.' })
    if (user.locked) return res.status(403).json({ error: 'This account has been locked. Contact a manager or admin.' })

    const passwordOk = await bcrypt.compare(password, user.passwordHash)
    if (!passwordOk) return res.status(401).json({ error: 'Invalid email or password.' })

    const accessToken = signAccessToken(user)
    res.json({ user: publicUser(user), accessToken })
  } catch (error) {
    res.status(500).json({ error: 'Could not log in.', detail: error.message })
  }
})

// GET /api/auth/me - resolves the current user from the access token, so the
// client can restore auth state on page load without asking for credentials again.
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || ''
    const accessToken = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!accessToken) return res.status(401).json({ error: 'Missing access token.' })

    const payload = verifyAccessToken(accessToken)
    const user = await User.findById(payload.sub)
    if (!user || user.locked) return res.status(401).json({ error: 'Session is no longer valid.' })

    res.json({ user: publicUser(user) })
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired access token.', detail: error.message })
  }
})

export default router
