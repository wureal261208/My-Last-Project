import { useMemo, useState } from 'react'
import { getAuthor, getCategory, getCover } from '../../utils/bookUtils'

const STORE_PAGE_SIZE = 10

function StorePage({
  account,
  books,
  cartItems,
  onAddToCart,
  onCheckout,
  onDetail,
  onRead,
  purchaseHistory,
  query,
  setQuery,
}) {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')
  const isAnonymous = account?.role === 'anonymous'
  const isVip = account?.accountType === 'vip'
  const normalizedQuery = query.trim().toLowerCase()
  const categories = useMemo(() => ['all', ...new Set(books.map(getCategory).slice(0, 14))], [books])
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
  const subtotal = cartItems.reduce((sum, item) => sum + getBookPrice(item), 0)
  const discount = isVip ? Math.round(subtotal * 0.15) : 0
  const total = Math.max(0, subtotal - discount)
  const purchasedIds = new Set(purchaseHistory.map((item) => item.id))

  function changeCategory(nextCategory) {
    setCategory(nextCategory)
    setPage(1)
  }

  return (
    <div className="store-page commerce-page">
      <section className="commerce-hero">
        <div>
          <p className="mono-eyebrow">Book store</p>
          <h1>Buy books, keep them in your library, read anywhere.</h1>
          <p>
            Anonymous visitors can preview books. Normal accounts can buy and read. VIP accounts get coupons, special tags,
            and a better checkout deal.
          </p>
        </div>
        <aside className="commerce-status-card">
          <span className={isVip ? 'vip-badge' : 'normal-badge'}>{isVip ? 'VIP account' : isAnonymous ? 'Anonymous' : 'Normal account'}</span>
          <strong>{isAnonymous ? 'Preview only' : `${cartItems.length} item${cartItems.length === 1 ? '' : 's'} in cart`}</strong>
          <small>{isVip ? '15% VIP coupon auto-applied.' : isAnonymous ? 'Login before checkout.' : 'Ready for secure checkout.'}</small>
        </aside>
      </section>

      <section className="store-layout">
        <div className="store-main">
          <form className="store-toolbar" onSubmit={(event) => event.preventDefault()}>
            <label>
              <i className="bi bi-search" />
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
              const price = getBookPrice(book)
              const isPurchased = purchasedIds.has(book.id)
              return (
                <article className="store-book-row" key={book.id}>
                  <button className="store-cover" onClick={() => onDetail(book)} type="button">
                    <img src={getCover(book)} alt={`${book.title} cover`} />
                  </button>
                  <div>
                    <span className="category">{getCategory(book)}</span>
                    <h2>{book.title}</h2>
                    <p>{getAuthor(book)}</p>
                    <small>{isPurchased ? 'Already in your library' : 'One-time purchase · online reader included'}</small>
                  </div>
                  <div className="store-actions">
                    <strong>{formatCurrency(price)}</strong>
                    {isPurchased ? (
                      <button className="primary-button" onClick={() => onRead(book)} type="button">
                        <i className="bi bi-journal-text" />
                        Read
                      </button>
                    ) : (
                      <button className="primary-button" onClick={() => onAddToCart(book)} type="button">
                        <i className="bi bi-cart-plus" />
                        {isAnonymous ? 'Login to buy' : 'Add'}
                      </button>
                    )}
                    <button className="ghost-button" onClick={() => onDetail(book)} type="button">
                      Detail
                    </button>
                  </div>
                </article>
              )
            })}
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
              <p className="mono-eyebrow">Cart</p>
              <h2>Checkout</h2>
            </div>
          </div>
          {cartItems.length ? (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span>{item.title}</span>
                  <strong>{formatCurrency(getBookPrice(item))}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-cart">Your cart is empty.</p>
          )}
          <div className="cart-totals">
            <span>Subtotal <strong>{formatCurrency(subtotal)}</strong></span>
            <span>VIP discount <strong>-{formatCurrency(discount)}</strong></span>
            <span>Total <strong>{formatCurrency(total)}</strong></span>
          </div>
          <button className="primary-button checkout-button" disabled={!cartItems.length} onClick={onCheckout} type="button">
            <i className="bi bi-credit-card" />
            {isAnonymous ? 'Login required' : 'Pay now'}
          </button>
        </aside>
      </section>
    </div>
  )
}

export function getBookPrice(book) {
  const seed = Number(String(book.id).replace(/\D/g, '').slice(-3)) || 99
  return Math.max(29000, (seed % 8) * 10000 + 39000)
}

export function formatCurrency(value) {
  return `${value.toLocaleString('vi-VN')}đ`
}

export default StorePage
