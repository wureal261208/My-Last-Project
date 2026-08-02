// Masks the local part of an email address for display to anyone who has
// account-management access to another person's record (Admin/Manager
// viewing Manager/Employee/Customer lists). Keeps the first 2 characters and
// the last character of the local part, and the full domain, e.g.
// "johnsmith@example.com" -> "jo*******h@example.com".
export function maskEmail(email) {
  const raw = String(email || '')
  const [localPart, domain = ''] = raw.split('@')
  if (!localPart || !domain) return raw

  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length))
  const visibleSuffix = localPart.length > 2 ? localPart.slice(-1) : ''
  const maskedLocal = `${visiblePrefix}${'*'.repeat(Math.max(2, localPart.length - 2))}${visibleSuffix}`
  return `${maskedLocal}@${domain}`
}
