import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_TTL = '7d'

function getSecret() {
  const value = process.env.JWT_ACCESS_SECRET
  if (!value) throw new Error('JWT_ACCESS_SECRET is not set. Add it to server/.env (any long random string works).')
  return value
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role, section: user.section || null },
    getSecret(),
    { expiresIn: ACCESS_TOKEN_TTL },
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret())
}
