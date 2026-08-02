import crypto from 'crypto'

// A readable-ish random password: 16 base64url characters, no ambiguous
// padding. Good enough for a one-time temporary password that the admin
// hands to the new Manager/Employee, who is expected to change it on first
// login (client-side prompt is a follow-up; for now this at minimum removes
// the single shared, publicly-visible-in-source 'Admin123' password.)
export function generateTemporaryPassword() {
  return crypto.randomBytes(12).toString('base64url')
}
