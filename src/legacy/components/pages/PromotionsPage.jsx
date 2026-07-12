import { BookOpen, Star } from 'lucide-react'

function PromotionsPage({ account, onStore }) {
  const isWorm = account?.accountType === 'worm' || account?.accountType === 'vip'
  const perks = [
    { code: 'WORM6', title: 'Rent up to 6 books at the same time', active: isWorm },
    { code: 'EARLYSHIP', title: 'Priority review for rental delivery', active: isWorm },
    { code: 'READERDEAL', title: 'Private rental promotions', active: isWorm },
  ]

  return (
    <div className="promotions-page commerce-page">
      <section className="commerce-hero vip-hero">
        <div>
          <p className="mono-eyebrow">Worm rental perks</p>
          <h1>{isWorm ? 'Your Worm benefits are active.' : 'Upgrade to Worm for better rental limits.'}</h1>
          <p>
            Worm accounts receive a visible Worm tag, a higher book rental limit, and special rental offers. Normal
            accounts can still rent books through the approval flow.
          </p>
          <button className="primary-button" onClick={onStore} type="button">
            <BookOpen size={16} aria-hidden="true" />
            Rent books
          </button>
        </div>
        <aside className="commerce-status-card">
          <span className={isWorm ? 'worm-badge' : 'normal-badge'}>{isWorm ? 'Worm' : 'Normal'}</span>
          <strong>{isWorm ? 'Perks unlocked' : 'Worm locked'}</strong>
          <small>{isWorm ? 'Rental benefits apply automatically.' : 'Admin can upgrade this account later.'}</small>
        </aside>
      </section>

      <section className="promo-grid">
        {perks.map((perk) => (
          <article className={perk.active ? 'promo-card active' : 'promo-card locked'} key={perk.code}>
            <span>{perk.code}</span>
            <h2>{perk.title}</h2>
            <p>{perk.active ? 'Ready for your rental account.' : 'Available after Worm upgrade.'}</p>
          </article>
        ))}
      </section>

      <section className="vip-notice">
        <Star size={30} aria-hidden="true" />
        <div>
          <h2>Worm account logic</h2>
          <p>
            Store `accountType: "worm"` in Firebase Custom Claims or Firestore user profile. The UI reads that value to
            show the Worm tag and apply the higher rental limit.
          </p>
        </div>
      </section>
    </div>
  )
}

export default PromotionsPage
