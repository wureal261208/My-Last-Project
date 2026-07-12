import { useMemo, useState } from 'react'
import { BookOpen, CheckCircle, Clock, Search, Truck } from 'lucide-react'
import { getAuthor, getCategory, getCover } from '../../utils/bookUtils'

const STORE_PAGE_SIZE = 10

function StorePage({
  account,
  books,
  rentalBasket = [],
  rentalLimit = 3,
  rentalRequests = [],
  onAddToCart,
  onCheckout,
  onDetail,
  onRead,
  query,
  setQuery,
}) {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')
  const isAnonymous = account?.role === 'anonymous'
  const isWorm = account?.accountType === 'worm' || account?.accountType === 'vip'
  const normalizedQuery = query.trim().toLowerCase()
  const categories = useMemo(() => ['all', ...new Set(books.map(getCategory).slice(0, 14))], [books])
  const activeRentals = rentalRequests.filter((item) => item.status !== 'received')
  const activeRentalIds = new Set(activeRentals.map((item) => item.bookId))
  const basketIds = new Set(rentalBasket.map((item) => item.id))
  const remainingSlots = Math.max(0, rentalLimit - activeRentals.length - rentalBasket.length)
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesQuery =
        !normalizedQuery ||
        book.title.toLowerCase().includes(normalizedQuery) ||
        getAuthor(book).toLowerCase().includes(normalizedQuery)
      const matchesCategory = category === 'all' || getCategory(book) === category
      return matchesQuery && matchesCategory
    })
  }, [books, category, normalizedQuery])
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / STORE_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedBooks = filteredBooks.slice((safePage - 1) * STORE_PAGE_SIZE, safePage * STORE_PAGE_SIZE)

  function changeCategory(nextCategory) {
    setCategory(nextCategory)
    setPage(1)
  }

  return (
    <div className="store-page commerce-page">
      <section className="commerce-hero">
        <div>
          <p className="mono-eyebrow">Online rental library</p>
          <h1>Rent books, wait for approval, then track delivery.</h1>
          <p>
            Anonymous visitors can preview books. Normal accounts can rent a limited number of books. Worm accounts get a
            higher rental limit and private rental offers.
          </p>
        </div>
        <aside className="commerce-status-card">
          <span className={isWorm ? 'worm-badge' : 'normal-badge'}>
            {isWorm ? 'Worm account' : isAnonymous ? 'Anonymous' : 'Normal account'}
          </span>
          <strong>{isAnonymous ? 'Preview only' : `${remainingSlots} rental slot${remainingSlots === 1 ? '' : 's'} left`}</strong>
          <small>{isWorm ? 'Worm rental perks are active.' : isAnonymous ? 'Login before renting.' : `Rental limit: ${rentalLimit} books.`}</small>
        </aside>
      </section>

      <section className="store-layout">
        <div className="store-main">
          <form className="store-toolbar" onSubmit={(event) => event.preventDefault()}>
            <label>
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books or authors..." />
            </label>
            <div className="topic-row">
              {categories.map((item) => (
                <button className={category === item ? 'active' : ''} key={item} onClick={() => changeCategory(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </form>

          <div className="store-list">
            {pagedBooks.map((book) => {
              const isActiveRental = activeRentalIds.has(book.id)
              const isInBasket = basketIds.has(book.id)

              return (
                <article className="store-book-row" key={book.id}>
                  <button className="store-cover" onClick={() => onDetail(book)} type="button">
                    <img src={getCover(book)} alt={`${book.title} cover`} />
                  </button>
                  <div>
                    <span className="category">{getCategory(book)}</span>
                    <h2>{book.title}</h2>
                    <p>{getAuthor(book)}</p>
                    <small>
                      {isActiveRental
                        ? 'Already in your rental dashboard'
                        : isInBasket
                          ? 'Ready to submit for approval'
                          : 'Rental request requires staff approval'}
                    </small>
                  </div>
                  <div className="store-actions">
                    {isActiveRental ? (
                      <button className="primary-button" onClick={() => onRead(book)} type="button">
                        <BookOpen size={16} aria-hidden="true" />
                        Read
                      </button>
                    ) : (
                      <button className="primary-button" disabled={isInBasket} onClick={() => onAddToCart(book)} type="button">
                        <BookOpen size={16} aria-hidden="true" />
                        {isAnonymous ? 'Login to rent' : isInBasket ? 'Selected' : 'Rent'}
                      </button>
                    )}
                    <button className="ghost-button" onClick={() => onDetail(book)} type="button">
                      Detail
                    </button>
                  </div>
                </article>
              )
            })}
            {!pagedBooks.length && (
              <div className="empty-state">
                No rental books match this filter. Admin can publish books with the For rent target from the dashboard.
              </div>
            )}
          </div>

          <nav className="pagination" aria-label="Store pagination">
            <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)} type="button">Prev</button>
            <span>Page {safePage} / {totalPages}</span>
            <button disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} type="button">Next</button>
          </nav>
        </div>

        <aside className="cart-panel">
          <div className="section-heading">
            <div>
              <p className="mono-eyebrow">Rental request</p>
              <h2>Pending approval</h2>
            </div>
          </div>
          {rentalBasket.length ? (
            <div className="cart-items">
              {rentalBasket.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span>{item.title}</span>
                  <strong>Pending</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-cart">No rental request selected.</p>
          )}
          <div className="rental-status-list">
            {rentalRequests.slice(0, 4).map((item) => (
              <span className={`rental-status-pill status-${item.status}`} key={item.id}>
                {getRentalIcon(item.status)}
                {formatRentalStatus(item.status)}
              </span>
            ))}
          </div>
          <button className="primary-button checkout-button" disabled={!rentalBasket.length} onClick={onCheckout} type="button">
            <Clock size={16} aria-hidden="true" />
            {isAnonymous ? 'Login required' : 'Submit rental'}
          </button>
        </aside>
      </section>
    </div>
  )
}

function getRentalIcon(status) {
  if (status === 'delivered') return <Truck size={15} aria-hidden="true" />
  if (status === 'received') return <CheckCircle size={15} aria-hidden="true" />
  return <Clock size={15} aria-hidden="true" />
}

function formatRentalStatus(status) {
  const labels = {
    pending: 'Pending',
    delivered: 'Đã giao',
    received: 'Đã nhận',
  }

  return labels[status] || status
}

export default StorePage
