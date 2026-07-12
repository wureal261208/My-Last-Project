export function getCover(book) {
  return book.formats?.['image/jpeg'] || book.cover || 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg'
}

export function getAuthor(book) {
  return book.authors?.map((author) => author.name).join(', ') || book.author || 'Unknown author'
}

export function getReaderUrl(book) {
  const formats = book.formats || {}

  return (
    formats['text/html'] ||
    formats['text/html; charset=utf-8'] ||
    formats['text/plain'] ||
    formats['text/plain; charset=utf-8'] ||
    book.readerUrl ||
    ''
  )
}

export function getCategory(book) {
  return book.bookshelves?.[0] || book.subjects?.[0]?.split('--')[0].trim() || book.category || 'Classic'
}

export function getBookAccessType(book = {}) {
  const configuredType = book.accessType || book.access_type || book.publishTarget || book.publish_target || book.commerceType
  if (configuredType === 'for-rent' || configuredType === 'rent' || configuredType === 'for-sale' || configuredType === 'sale') return 'for-rent'
  if (configuredType === 'free-to-read' || configuredType === 'free') return 'free-to-read'

  const numericSeed = Number(String(book.id || '').replace(/\D/g, '').slice(-2))
  return Number.isFinite(numericSeed) && numericSeed % 3 === 0 ? 'for-rent' : 'free-to-read'
}

export function isBookForSale(book) {
  return getBookAccessType(book) === 'for-rent'
}

export function getBookRating(book = {}) {
  const reviewCount = getBookReviewCount(book)
  const popularitySeed = Math.min(0.9, Math.log10((book.download_count || 1000) + 1) / 8)
  const reviewSeed = Math.min(0.4, reviewCount / 5000)

  return Math.min(5, 3.7 + popularitySeed + reviewSeed).toFixed(1)
}

export function getBookReviewCount(book = {}) {
  const explicitReviews = Number(book.reviewCount || book.review_count || book.ratingsCount || book.ratings_count)
  if (Number.isFinite(explicitReviews) && explicitReviews >= 0) return Math.floor(explicitReviews)

  return Math.max(12, Math.floor((book.download_count || 1200) / 38))
}

export function getDescription(book) {
  const subjects = book.subjects?.slice(0, 3).join(', ')
  return (
    book.description ||
    `A public-domain ${getCategory(book).toLowerCase()} title by ${getAuthor(book)}. Explore the story, save it to your shelf, and continue reading in the BookWorm reader.${subjects ? ` Subjects: ${subjects}.` : ''}`
  )
}

export function getInitials(name = '') {
  const clean = name.trim()
  if (!clean) return 'BW'

  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
