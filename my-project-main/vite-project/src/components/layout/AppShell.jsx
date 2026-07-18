import { useEffect, useState } from 'react'
import { getInitials } from '../../utils/bookUtils'
import logo from '../../assets/logo.jpg'
import { useNavigation } from '../../context/NavigationContext'
import { hasAccess, normalizeRole } from '../../data/bookData'

const navItems = [
  { id: 'home', label: 'Home', icon: 'bi-house' },
  { id: 'discover', label: 'Discover', icon: 'bi-compass' },
  { id: 'requests', label: 'Rent a book', icon: 'bi-bag-plus', private: true },
  { id: 'profile', label: 'Profile', icon: 'bi-person-circle', private: true },
  { id: 'admin', label: 'Management', icon: 'bi-shield-lock', admin: true },
]
const managementNavIds = ['profile', 'admin']

const themeOrder = ['paper', 'mint', 'ink']
const themeIcons = { paper: 'bi-sun', mint: 'bi-moon-stars', ink: 'bi-moon' }
const themeNextLabel = { paper: 'Switch to Mint theme', mint: 'Switch to Dark theme', ink: 'Switch to Paper theme' }

function AppShell({ account, children, notifications = [], onAuth, onGuest, onLogout, onOpenRequests, setWebsiteTheme, websiteTheme = 'paper' }) {
  const { activePage, isPageLoading, navigateTo } = useNavigation()



  const [rememberedAdminAccess, setRememberedAdminAccess] = useState(false)
  const normalizedRole = normalizeRole(account?.role)
  const isGuest = normalizedRole === 'guest'
  const isAdmin = hasAccess(normalizedRole, 'employee')
  const isAdminPage = activePage === 'admin'
  const canShowAdminNav = isAdmin || isAdminPage || rememberedAdminAccess
  const isManagementNavContext = canShowAdminNav && managementNavIds.includes(activePage)
  const displayName = account?.name || 'None Account'
  const unreadNotifications = isGuest
    ? 0
    : notifications.filter((item) => item.targetEmail === account?.email && !item.read).length
  const visibleNavItems = navItems.filter((item) => {
    if (isManagementNavContext && !managementNavIds.includes(item.id)) return false
    if (item.admin && !canShowAdminNav) return false
    if (item.private && isGuest) return false
    return true
  })

  useEffect(() => {
    let isCurrent = true

    if (isGuest) {
      if (rememberedAdminAccess) {
        queueMicrotask(() => {
          if (isCurrent) setRememberedAdminAccess(false)
        })
      }
      return () => {
        isCurrent = false
      }
    }

    if ((isAdmin || isAdminPage) && !rememberedAdminAccess) {
      queueMicrotask(() => {
        if (isCurrent) setRememberedAdminAccess(true)
      })
    }

    return () => {
      isCurrent = false
    }
  }, [isAdmin, isAdminPage, isGuest, rememberedAdminAccess])

  function handleLogoClick() {
    if (canShowAdminNav) {
      navigateTo('admin')
      return
    }

    if (isGuest) {
      onAuth()
      return
    }

    navigateTo('profile')
  }

  return (
    <div className={`book-app app-theme-${websiteTheme}`}>
      <header className="site-header">
        <button className="brand-button" onClick={handleLogoClick} type="button">
          <img src={logo} alt="BookWorm logo" />
          <span>BookWorm</span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => {
            if (item.admin && !canShowAdminNav) return null
            if (item.private && isGuest) return null

            return (
              <button
                className={activePage === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => navigateTo(item.id)}
                type="button"
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="header-account">
          {!isGuest && (
            <button
              aria-label={`Notifications${unreadNotifications ? ` (${unreadNotifications} unread)` : ''}`}
              className="notification-bell"
              onClick={() => (onOpenRequests ? onOpenRequests() : navigateTo('requests'))}
              title="Rental requests and notifications"
              type="button"
            >
              <i className="bi bi-bell" />
              {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
            </button>
          )}
          {typeof setWebsiteTheme === 'function' && (
            <div className="quick-theme-toggle">
              <button
                aria-label={themeNextLabel[websiteTheme] || 'Switch theme'}
                onClick={() => {
                  const nextIndex = (themeOrder.indexOf(websiteTheme) + 1) % themeOrder.length
                  setWebsiteTheme(themeOrder[nextIndex])
                }}
                title={themeNextLabel[websiteTheme] || 'Switch theme'}
                type="button"
              >
                <i className={`bi ${themeIcons[websiteTheme] || 'bi-sun'}`} />
              </button>
            </div>
          )}
          <button className="avatar-chip" onClick={() => (isGuest ? onAuth() : navigateTo('profile'))} type="button">
            <span>
              {account?.avatar ? <img src={account.avatar} alt="" /> : getInitials(displayName)}
            </span>
            <strong>{displayName}</strong>
          </button>
          {isGuest ? (
            <>
              <button className="ghost-button" onClick={onGuest} type="button">
                None account
              </button>
              <button className="primary-button" onClick={onAuth} type="button">
                Login
              </button>
            </>
          ) : (
            <button className="ghost-button" onClick={onLogout} type="button">
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="page-shell">{children}</main>
      {!isAdminPage && <footer className="site-footer">
        <section className="footer-brand">
          <div className="footer-logo">
            <img src={logo} alt="BookWorm logo" />
          </div>
          <div>
            <strong>BookWorm</strong>
            <p>A focused digital library for keeping books, comments, and checkpoints in one quiet place.</p>
          </div>
        </section>
        <section className="footer-columns">
          <nav aria-label="Footer navigation">
            <span>Explore</span>
            {!['admin', 'profile'].includes(activePage) && (
              <>
                <button className="footer-link" onClick={() => navigateTo('home')} type="button">Home</button>
                <button className="footer-link" onClick={() => navigateTo('discover')} type="button">Discover</button>
              </>
            )}
            {!isGuest && <button onClick={() => navigateTo('profile')} type="button">Profile</button>}
            {canShowAdminNav && <button onClick={() => navigateTo('admin')} type="button">Management</button>}
          </nav>
          <div>
            <span>Reader tools</span>
            <p>Checkpoint sync</p>
            <p>Personal notes - Coming soon</p>
            <p>Community comments</p>
          </div>
        </section>
      </footer>}
      {isPageLoading && (
        <div className="route-loader" role="status">
          <img src={logo} alt="BookWorm logo" />
          <span>Opening page...</span>
        </div>
      )}
    </div>
  )
}

export default AppShell
