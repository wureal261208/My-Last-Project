export const API_URL = 'https://gutendex.com/books'

// The site catalog now comes entirely from MongoDB (seeded from the
// Project Gutenberg CSV import). This used to fall back to a hardcoded
// sample list when the API was unreachable, but that meant books not
// actually in Mongo could show up on the site - removed on purpose.
export const fallbackBooks = []

export function mergeBookCatalogs(primaryBooks = [], secondaryBooks = fallbackBooks) {
  const combinedBooks = [...secondaryBooks, ...primaryBooks]
  const uniqueBooks = []
  const seenIds = new Set()

  for (const book of combinedBooks) {
    if (!book?.id || seenIds.has(book.id)) continue
    seenIds.add(book.id)
    uniqueBooks.push(book)
  }

  return uniqueBooks
}

export const BOOK_ACCESS_LABELS = {
  read: 'To Read',
  rent: 'To Rent',
}

export const ROLE_LABELS = {
  guest: 'Guest',
  customer: 'Customer',
  employee: 'Employee',
  manager: 'Manager',
  admin: 'Admin',
}

export const ROLE_LEVELS = {
  guest: 0,
  customer: 1,
  employee: 2,
  manager: 3,
  admin: 4,
}

export const ROLE_ORDER = ['guest', 'customer', 'employee', 'manager', 'admin']

export function normalizeRole(role) {
  const value = (role || '').toLowerCase()
  return ROLE_ORDER.includes(value) ? value : 'customer'
}

export function getRoleLevel(role) {
  return ROLE_LEVELS[normalizeRole(role)] ?? 1
}

export function hasAccess(role, minimumRole) {
  return getRoleLevel(role) >= getRoleLevel(minimumRole)
}

// Reference credentials used by backend/scripts/seedTestAccounts.js to
// provision the 4 test roles (Admin/Manager/Employee/Customer) end to end.
export const starterAccounts = [
  { name: 'Customer Demo', email: 'customer@bookworm.test', password: 'customer123', role: 'customer' },
  { name: 'Employee Demo', email: 'employee@bookworm.test', password: 'employee123', role: 'employee' },
  { name: 'Manager Demo', email: 'manager@bookworm.test', password: 'manager123', role: 'manager' },
  { name: 'Admin Demo', email: 'admin@bookworm.test', password: 'admin123', role: 'admin' },
]
