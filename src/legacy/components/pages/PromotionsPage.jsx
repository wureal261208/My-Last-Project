function PromotionsPage({ account, onStore }) {
  const isVip = account?.accountType === 'vip'
  const coupons = [
    { code: 'VIP15', title: '15% off all book orders', active: isVip },
    { code: 'BUNDLE30', title: 'Bundle discount for 3+ books', active: isVip },
    { code: 'WEEKEND', title: 'Weekend reader reward', active: isVip },
  ]

  return (
    <div className="promotions-page commerce-page">
      <section className="commerce-hero vip-hero">
        <div>
          <p className="mono-eyebrow">VIP promotions</p>
          <h1>{isVip ? 'Your VIP benefits are active.' : 'Upgrade to VIP for better reading deals.'}</h1>
          <p>
            VIP accounts receive coupons, visible VIP tags in the system, and special offers for buying multiple books.
            Normal accounts can still buy normally from the store.
          </p>
          <button className="primary-button" onClick={onStore} type="button">
            <i className="bi bi-bag-heart" />
            Shop books
          </button>
        </div>
        <aside className="commerce-status-card">
          <span className={isVip ? 'vip-badge' : 'normal-badge'}>{isVip ? 'VIP' : 'Normal'}</span>
          <strong>{isVip ? 'Coupons unlocked' : 'VIP locked'}</strong>
          <small>{isVip ? 'Discounts apply automatically at checkout.' : 'Admin/payment flow can upgrade this account later.'}</small>
        </aside>
      </section>

      <section className="promo-grid">
        {coupons.map((coupon) => (
          <article className={coupon.active ? 'promo-card active' : 'promo-card locked'} key={coupon.code}>
            <span>{coupon.code}</span>
            <h2>{coupon.title}</h2>
            <p>{coupon.active ? 'Ready to use at checkout.' : 'Available after VIP upgrade.'}</p>
          </article>
        ))}
      </section>

      <section className="vip-notice">
        <i className="bi bi-stars" />
        <div>
          <h2>VIP system logic</h2>
          <p>
            Store `accountType: "vip"` in Firebase Custom Claims or Firestore user profile. The UI reads that value to
            show the VIP tag and auto-apply discounts.
          </p>
        </div>
      </section>
    </div>
  )
}

export default PromotionsPage
