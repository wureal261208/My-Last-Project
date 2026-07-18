import mongoose from 'mongoose'

const USAGE_TYPES = ['read', 'rent', 'both', 'none']

// The "books" collection already holds imported Project Gutenberg records
// (capitalized keys like Title / Authors / Bookshelves). We keep the schema
// loose (`strict: false`) so those existing documents stay valid, and only
// enforce the fields BookWorm's own tooling actually depends on.
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, index: true },
    author: { type: String, trim: true },
    cover: { type: String, trim: true },
    description: { type: String, trim: true },
    // read: free to open, rent: needs a rental, both: either, none: not yet published on the site.
    usageType: { type: String, enum: USAGE_TYPES, default: 'none', index: true },
    source: { type: String, default: 'manual' }, // 'manual' | 'gutenberg-import' | 'firebase-migration'
  },
  { timestamps: true, collection: 'books', strict: false },
)

// Case-insensitive lookup helper used by /books/add to avoid duplicates,
// since imported records may use `Title` and app-created ones use `title`.
bookSchema.statics.findByTitle = function findByTitle(title) {
  const trimmed = String(title || '').trim()
  if (!trimmed) return null
  const pattern = new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  return this.findOne({ $or: [{ title: pattern }, { Title: pattern }] })
}

export const BOOK_USAGE_TYPES = USAGE_TYPES
export default mongoose.models.Book || mongoose.model('Book', bookSchema)
