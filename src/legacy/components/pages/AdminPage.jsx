import { useMemo, useState } from 'react'
import { getAuthor, getBookAccessType, getCategory, getCover, getDescription, getReaderUrl } from '../../utils/bookUtils'
import { getBookChapters, getTotalPages } from '../../utils/chapterUtils'

const identityFields = [
  { name: 'title', label: 'Title', placeholder: 'Book title' },
  { name: 'author', label: 'Author', placeholder: 'Author name' },
  { name: 'category', label: 'Category', placeholder: 'Fantasy fiction' },
]

const mediaFields = [
  { name: 'cover', label: 'Cover URL', placeholder: 'https://...' },
  { name: 'readerUrl', label: 'Reader URL', placeholder: 'https://...', type: 'url' },
]

const languageChoices = [
  { value: 'en', label: 'English', disabled: false },
  { value: 'vi', label: 'Vietnamese - Coming soon', disabled: true },
  { value: 'jp', label: 'Japanese - Coming soon', disabled: true },
]

const adminBookFilters = [
  { id: 'all', label: 'All books' },
  { id: 'free-to-read', label: 'Free-to-read' },
  { id: 'for-sale', label: 'For-sale' },
  { id: 'reader-ready', label: 'Ready for Reader' },
  { id: 'missing-cover', label: 'Missing Cover' },
  { id: 'missing-chapters', label: 'Missing Chapters' },
]

function AdminPage({
  account,
  addLocalBook,
  adminBook,
  books,
  editLocalBook,
  localBooks,
  removeLocalBook,
  resetAdminBook,
  setAdminBook,
  setStaff,
  staff,
  users,
}) {
  const [activeAdminSection, setActiveAdminSection] = useState('book')
  const [bookFilter, setBookFilter] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const publishedBooks = localBooks.filter((book) => (book.status || 'published') === 'published').length
  const freeBooks = localBooks.filter((book) => getBookAccessType(book) === 'free-to-read').length
  const saleBooks = localBooks.filter((book) => getBookAccessType(book) === 'for-sale').length
  const currentWarnings = getFormWarnings(adminBook)
  const previewBook = useMemo(() => createPreviewBook(adminBook), [adminBook])
  const filteredLocalBooks = localBooks.filter((book) => {
    if (bookFilter === 'reader-ready') return isReaderReady(book)
    if (bookFilter === 'free-to-read') return getBookAccessType(book) === 'free-to-read'
    if (bookFilter === 'for-sale') return getBookAccessType(book) === 'for-sale'
    if (bookFilter === 'missing-cover') return !hasCover(book)
    if (bookFilter === 'missing-chapters') return !hasChapters(book)
    return true
  })

  function updateAdminBook(name, value) {
    setAdminBook({ ...adminBook, [name]: value })
  }

  function updateChapter(index, field, value) {
    const chapters = adminBook.chaptersDraft?.length ? adminBook.chaptersDraft : [createEmptyChapter(0)]
    setAdminBook({
      ...adminBook,
      chaptersDraft: chapters.map((chapter, chapterIndex) => (
        chapterIndex === index ? { ...chapter, [field]: value } : chapter
      )),
    })
  }

  function addChapter() {
    const chapters = adminBook.chaptersDraft?.length ? adminBook.chaptersDraft : []
    setAdminBook({
      ...adminBook,
      chaptersDraft: [...chapters, createEmptyChapter(chapters.length)],
    })
  }

  function removeChapter(index) {
    const chapters = adminBook.chaptersDraft?.length ? adminBook.chaptersDraft : [createEmptyChapter(0)]
    setAdminBook({
      ...adminBook,
      chaptersDraft: chapters.length === 1 ? [createEmptyChapter(0)] : chapters.filter((_, chapterIndex) => chapterIndex !== index),
    })
  }

  function addStaff(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const next = {
      id: Date.now(),
      name: form.get('name').trim(),
      email: form.get('email').trim().toLowerCase(),
      role: form.get('role'),
      specialty: form.get('specialty') || 'free-to-read',
      managerEmail: form.get('managerEmail') || '',
      taskSummary: form.get('taskSummary')?.trim() || 'No task report yet.',
    }
    if (!next.name || !next.email) return
    setStaff((current) => [next, ...current.filter((item) => item.email !== next.email)])
    event.currentTarget.reset()
  }

  function updateStaff(email, updates) {
    setStaff((current) => current.map((member) => (member.email === email ? { ...member, ...updates } : member)))
  }

  function removeStaff(email) {
    setStaff((current) => current.filter((member) => member.email !== email))
  }

  const managers = staff.filter((member) => member.role === 'manager')
  const employees = staff.filter((member) => member.role === 'employee')
  const permissions = getAdminPermissions(account)

  return (
    <div className="admin-page">
      <section className="page-title admin-title">
        <div>
          <p className="mono-eyebrow">Admin dashboard</p>
          <h1>Profile and access control</h1>
        </div>
        <p>
          This dashboard starts with the signed-in staff profile and the exact permissions available to that role.
        </p>
      </section>

      <AdminAccessProfile account={account} permissions={permissions} />

      <div className="admin-sticky-switcher" role="tablist" aria-label="Admin sections">
        <button className={activeAdminSection === 'book' ? 'active' : ''} onClick={() => setActiveAdminSection('book')} type="button">
          <i className="bi bi-journal-plus" />
          Push Book
        </button>
        <button className={activeAdminSection === 'team' ? 'active' : ''} onClick={() => setActiveAdminSection('team')} type="button">
          <i className="bi bi-person-plus" />
          Team
        </button>
      </div>

      <div className="metrics admin-metrics">
        <article><strong>{books.length}</strong><span>Books on main</span></article>
        <article><strong>{publishedBooks}</strong><span>Published admin books</span></article>
        <article><strong>{freeBooks}</strong><span>Free-to-read books</span></article>
        <article><strong>{saleBooks}</strong><span>For-sale books</span></article>
      </div>

      {activeAdminSection === 'book' ? (
        <section className="admin-workspace">
          <div className="section-heading">
            <div>
              <p className="mono-eyebrow">Main library</p>
              <h2>{adminBook.id ? 'Edit book' : 'Push new book'}</h2>
            </div>
            <span>Used by Home, Discover, Detail, and Reader</span>
          </div>

          <div className="admin-validation-panel" aria-live="polite">
            <strong>{currentWarnings.length ? 'Needs attention' : 'Ready checklist'}</strong>
            {currentWarnings.length ? (
              currentWarnings.map((warning) => (
                <span key={warning.id}>
                  <i className="bi bi-exclamation-circle" />
                  {warning.message}
                </span>
              ))
            ) : (
              <span>
                <i className="bi bi-check-circle" />
                This book has the key Detail and Reader fields.
              </span>
            )}
          </div>

          <form className="admin-form admin-book-form" onSubmit={addLocalBook}>
            <fieldset>
              <legend>Detail information</legend>
              {identityFields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  <input
                    type={field.type || 'text'}
                    value={adminBook[field.name]}
                    onChange={(event) => updateAdminBook(field.name, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <label>
                Publish target
                <select value={adminBook.accessType || 'free-to-read'} onChange={(event) => updateAdminBook('accessType', event.target.value)}>
                  <option value="free-to-read">Free-to-read library</option>
                  <option value="for-sale">For-sale store</option>
                </select>
              </label>
              <label>
                Status
                <select value={adminBook.status} onChange={(event) => updateAdminBook('status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <div className="admin-choice-field">
                <span>Language</span>
                <div className="admin-choice-grid">
                  {languageChoices.map((choice) => (
                    <button
                      className={adminBook.language === choice.value ? 'active' : ''}
                      disabled={choice.disabled}
                      key={choice.value}
                      onClick={() => updateAdminBook('language', choice.value)}
                      type="button"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="wide-field">
                Description
                <textarea
                  value={adminBook.description}
                  onChange={(event) => updateAdminBook('description', event.target.value)}
                  placeholder="Short book description shown on the detail page."
                />
              </label>
              <label className="wide-field">
                Subjects
                <input
                  value={adminBook.subjects}
                  onChange={(event) => updateAdminBook('subjects', event.target.value)}
                  placeholder="Adventure, Mystery, Classic"
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Reader setup</legend>
              {mediaFields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  <input
                    type={field.type || 'text'}
                    value={adminBook[field.name]}
                    onChange={(event) => updateAdminBook(field.name, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <label className="wide-field">
                Reader text
                <textarea
                  value={adminBook.readerText}
                  onChange={(event) => updateAdminBook('readerText', event.target.value)}
                  placeholder="Optional full plain book text. Chapter content below is preferred."
                />
              </label>
            </fieldset>

            <fieldset className="admin-chapter-fieldset">
              <legend>Chapters</legend>
              <div className="admin-chapter-list">
                {(adminBook.chaptersDraft?.length ? adminBook.chaptersDraft : [createEmptyChapter(0)]).map((chapter, index) => (
                  <article className="admin-chapter-editor" key={`${index}-${chapter.title}`}>
                    <div className="admin-chapter-heading">
                      <strong>Chapter {index + 1}</strong>
                      <button className="ghost-button" onClick={() => removeChapter(index)} type="button">Remove</button>
                    </div>
                    <label>
                      Title
                      <input
                        value={chapter.title}
                        onChange={(event) => updateChapter(index, 'title', event.target.value)}
                        placeholder={`Chapter ${index + 1}`}
                      />
                    </label>
                    <label>
                      Pages
                      <input
                        min="1"
                        type="number"
                        value={chapter.pages}
                        onChange={(event) => updateChapter(index, 'pages', event.target.value)}
                      />
                    </label>
                    <label className="wide-field">
                      Content
                      <textarea
                        value={chapter.content}
                        onChange={(event) => updateChapter(index, 'content', event.target.value)}
                        placeholder="Paste this chapter content..."
                      />
                    </label>
                  </article>
                ))}
              </div>
              <button className="ghost-button admin-add-chapter" onClick={addChapter} type="button">
                <i className="bi bi-plus-circle" />
                Add chapter
              </button>
            </fieldset>

            <div className="admin-form-actions">
              <button className="ghost-button" onClick={() => setShowPreview(true)} type="button">
                <i className="bi bi-eye" />
                Preview as Detail
              </button>
              {adminBook.id && (
                <button className="ghost-button" onClick={resetAdminBook} type="button">
                  Cancel edit
                </button>
              )}
              <button className="primary-button" type="submit">
                <i className="bi bi-cloud-upload" />
                {adminBook.id ? 'Update book' : 'Add book to admin'}
              </button>
            </div>
          </form>

          <div className="admin-filter-bar" aria-label="Filter admin books">
            {adminBookFilters.map((filter) => (
              <button className={bookFilter === filter.id ? 'active' : ''} key={filter.id} onClick={() => setBookFilter(filter.id)} type="button">
                {filter.label}
              </button>
            ))}
          </div>

          <div className="admin-two-col">
            <section className="admin-table">
              <h2>Admin books</h2>
              {filteredLocalBooks.length ? (
                filteredLocalBooks.map((book) => {
                  const totalPages = getTotalPages(book)
                  const chapters = getBookChapters(book, totalPages)
                  const warnings = getBookWarnings(book)

                  return (
                    <div className="table-row admin-book-row" key={book.id}>
                      <img src={getCover(book)} alt="" />
                      <span>
                        {book.title}
                        <em className={`admin-status status-${book.status || 'published'}`}>{book.status || 'published'}</em>
                        <em className={`admin-status status-${getBookAccessType(book)}`}>{getBookAccessType(book)}</em>
                      </span>
                      <small>{getAuthor(book)} - {getCategory(book)} - {chapters.length} chapters</small>
                      <div className="admin-row-actions">
                        {warnings.length > 0 && <strong>{warnings.length} warnings</strong>}
                        <button className="ghost-button" onClick={() => editLocalBook(book)} type="button">Edit</button>
                        <button className="ghost-button" onClick={() => removeLocalBook(book.id)} type="button">Remove</button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p>No books match this filter.</p>
              )}
            </section>

            <section className="admin-table admin-guidelines">
              <h2>Main site checklist</h2>
              <div className="admin-check-row">
                <i className="bi bi-house" />
                <span>Home needs title, cover, category, and author.</span>
              </div>
              <div className="admin-check-row">
                <i className="bi bi-journal-text" />
                <span>Detail needs description, pages, chapters, language, and subjects.</span>
              </div>
              <div className="admin-check-row">
                <i className="bi bi-book" />
                <span>Reader needs reader URL, full reader text, or chapter content.</span>
              </div>
            </section>
          </div>
        </section>
      ) : (
        <section className="admin-workspace">
          <div className="section-heading">
            <div>
              <p className="mono-eyebrow">Team access</p>
              <h2>Co-op manager / employee</h2>
            </div>
              <span>Admin controls two managers: one for free reader books and one for sale books.</span>
            </div>

          <form className="admin-form compact-form" onSubmit={addStaff}>
            <p className="form-note">
              Staff created here can login with their email and default password <strong>Admin123</strong>. Later, Cloud Functions should set matching Firebase Custom Claims.
            </p>
            <label>Name<input name="name" placeholder="Manager or employee name" /></label>
            <label>Email<input name="email" placeholder="team@bookworm.com" type="email" /></label>
            <label>
              Role
              <select name="role" defaultValue="employee">
                <option value="manager">Co-op Admin / Manager</option>
                <option value="employee">Employee</option>
              </select>
            </label>
            <label>
              Specialty
              <select name="specialty" defaultValue="free-to-read">
                <option value="free-to-read">Reading books manager</option>
                <option value="for-sale">Sale books manager</option>
              </select>
            </label>
            <label>
              Assigned manager
              <select name="managerEmail" defaultValue="">
                <option value="">Direct admin assignment</option>
                {managers.map((manager) => (
                  <option key={manager.email} value={manager.email}>{manager.name}</option>
                ))}
              </select>
            </label>
            <label className="wide-field">
              Employee task report
              <input name="taskSummary" placeholder="Imported chapters, checked covers, prepared sale metadata..." />
            </label>
            <button className="primary-button" type="submit">Create account</button>
          </form>

          <div className="admin-two-col">
            <section className="admin-table staff-table">
              <h2>Manager accounts</h2>
              {managers.length ? (
                managers.map((member) => (
                  <div className="table-row staff-row" key={member.email}>
                    <span>{member.name}</span>
                    <SnippetText label="Email" value={member.email} />
                    <strong>{member.specialty === 'for-sale' ? 'Sale books manager' : 'Reading books manager'}</strong>
                    <div className="admin-row-actions">
                      <select value={member.specialty || 'free-to-read'} onChange={(event) => updateStaff(member.email, { specialty: event.target.value })}>
                        <option value="free-to-read">Reading books</option>
                        <option value="for-sale">Sale books</option>
                      </select>
                      <button className="ghost-button" onClick={() => updateStaff(member.email, { role: 'employee' })} type="button">Make employee</button>
                      <button className="ghost-button" onClick={() => removeStaff(member.email)} type="button">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No manager accounts yet. Create one manager for reading books and one for sale books.</p>
              )}
            </section>

            <section className="admin-table staff-table">
              <h2>Employee reports</h2>
              {employees.length ? (
                employees.map((member) => (
                  <div className="table-row staff-row" key={member.email}>
                    <span>{member.name}</span>
                    <SnippetText label="Email" value={member.email} />
                    <strong>{getManagerName(member.managerEmail, managers)}</strong>
                    <p>{member.taskSummary || 'No task report yet.'}</p>
                    <div className="admin-row-actions">
                      <select value={member.managerEmail || ''} onChange={(event) => updateStaff(member.email, { managerEmail: event.target.value })}>
                        <option value="">Direct admin assignment</option>
                        {managers.map((manager) => (
                          <option key={manager.email} value={manager.email}>{manager.name}</option>
                        ))}
                      </select>
                      <button className="ghost-button" onClick={() => updateStaff(member.email, { role: 'manager', specialty: 'free-to-read' })} type="button">Make manager</button>
                      <button className="ghost-button" onClick={() => removeStaff(member.email)} type="button">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No employee accounts yet.</p>
              )}
            </section>

            <section className="admin-table">
              <h2>Known main users</h2>
              {users.length ? (
                users.map((user) => (
                  <div className="table-row" key={user.email}>
                    <span>{user.name}</span>
                    <SnippetText label="Email" value={user.email} />
                    <strong>{user.role}</strong>
                  </div>
                ))
              ) : (
                <p>No users recorded yet.</p>
              )}
            </section>
          </div>
        </section>
      )}

      {showPreview && <AdminDetailPreview book={previewBook} onClose={() => setShowPreview(false)} />}
    </div>
  )
}

function AdminAccessProfile({ account = {}, permissions = [] }) {
  return (
    <section className="admin-access-profile">
      <div className="admin-profile-card">
        <div>
          <p className="mono-eyebrow">Signed-in profile</p>
          <h2>{account.name || 'Staff account'}</h2>
          <span className={`admin-status status-${account.role || 'employee'}`}>{account.role || 'employee'}</span>
          <span className={account.accountType === 'vip' ? 'vip-badge' : 'normal-badge'}>
            {account.accountType === 'vip' ? 'VIP' : 'Normal'}
          </span>
        </div>
        <SnippetText label="Email" value={account.email || 'No email available'} />
        <SnippetText label="Firebase UID" value={account.id || 'No Firebase UID available'} />
      </div>

      <div className="admin-permission-card">
        <p className="mono-eyebrow">Admin permissions</p>
        <h2>Permission scope</h2>
        <div className="admin-permission-list">
          {permissions.map((permission) => (
            <span key={permission}>
              <i className="bi bi-check2-circle" />
              {permission}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SnippetText({ label, value }) {
  return (
    <div className="snippet-text">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  )
}

function getAdminPermissions(account = {}) {
  if (account.role === 'admin') {
    return [
      'Publish, edit, and remove reader/store books',
      'Create, delete, and promote managers',
      'Assign employees and review task reports',
      'View staff profile and permission metadata',
    ]
  }

  if (account.role === 'manager') {
    return [
      'Review assigned book workflow',
      'Track employees assigned by admin',
      'View profile and permission metadata',
    ]
  }

  return [
    'View assigned work profile',
    'Review personal task report state',
    'View profile and permission metadata',
  ]
}

function AdminDetailPreview({ book, onClose }) {
  const totalPages = getTotalPages(book)
  const chapters = getBookChapters(book, totalPages)

  return (
    <div className="reader-modal-backdrop admin-preview-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-preview-title">
      <div className="admin-preview-modal">
        <button aria-label="Close preview" className="admin-preview-close" onClick={onClose} type="button">
          <i className="bi bi-x-lg" />
        </button>
        <img src={getCover(book)} alt="" />
        <div>
          <p className="mono-eyebrow">{getCategory(book)}</p>
          <h2 id="admin-preview-title">{book.title || 'Untitled book'}</h2>
          <p>{getAuthor(book)}</p>
          <p>{getDescription(book)}</p>
          <div className="admin-preview-meta">
            <span>{totalPages} pages</span>
            <span>{chapters.length} chapters</span>
            <span>{book.languages?.[0]?.toUpperCase() || 'EN'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function createPreviewBook(adminBook) {
  const subjects = adminBook.subjects
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean)
  const chapters = normalizePreviewChapters(adminBook.chaptersDraft)

  return {
    ...adminBook,
    id: adminBook.id || 'admin-preview',
    title: adminBook.title.trim() || 'Untitled book',
    author: adminBook.author.trim() || 'BookWorm editor',
    category: adminBook.category.trim() || 'Admin pick',
    authors: [{ name: adminBook.author.trim() || 'BookWorm editor' }],
    bookshelves: [adminBook.category.trim() || 'Admin pick'],
    accessType: adminBook.accessType === 'for-sale' ? 'for-sale' : 'free-to-read',
    subjects,
    languages: ['en'],
    pageCount: chapters.reduce((total, chapter) => total + chapter.pages, 0) || 120,
    chapterCount: chapters.length || 1,
    chapterList: chapters,
    formats: {
      ...(adminBook.cover.trim() ? { 'image/jpeg': adminBook.cover.trim() } : {}),
      ...(adminBook.readerUrl.trim() ? { 'text/html': adminBook.readerUrl.trim() } : {}),
    },
  }
}

function normalizePreviewChapters(chapters = []) {
  let startPage = 1
  return (chapters.length ? chapters : [createEmptyChapter(0)]).map((chapter, index) => {
    const pages = Number(chapter.pages) > 0 ? Math.floor(Number(chapter.pages)) : 1
    const nextChapter = {
      number: index + 1,
      title: chapter.title?.trim() || `Chapter ${index + 1}`,
      startPage,
      pages,
      content: chapter.content || '',
    }
    startPage += pages
    return nextChapter
  })
}

function getManagerName(managerEmail, managers) {
  if (!managerEmail) return 'Direct admin assignment'
  return managers.find((manager) => manager.email === managerEmail)?.name || 'Manager no longer exists'
}

function getFormWarnings(book) {
  return [
    !hasText(book.cover) && { id: 'cover', message: 'Missing cover image for Home and Detail.' },
    !hasText(book.description) && { id: 'description', message: 'Missing description for Detail preview.' },
    !hasText(book.readerUrl) && !hasText(book.readerText) && !book.chaptersDraft?.some((chapter) => hasText(chapter.content)) && {
      id: 'reader',
      message: 'Missing reader URL, reader text, or chapter content.',
    },
    !book.chaptersDraft?.some((chapter) => hasText(chapter.title) && hasText(chapter.pages)) && {
      id: 'chapters',
      message: 'Missing chapter title or pages.',
    },
  ].filter(Boolean)
}

function getBookWarnings(book) {
  return [
    !hasCover(book) && { id: 'cover' },
    !hasText(book.description) && { id: 'description' },
    !isReaderReady(book) && { id: 'reader' },
    !hasChapters(book) && { id: 'chapters' },
  ].filter(Boolean)
}

function createEmptyChapter(index) {
  return { title: `Chapter ${index + 1}`, pages: '10', content: '' }
}

function hasText(value) {
  return String(value || '').trim().length > 0
}

function hasCover(book) {
  return Boolean(book.formats?.['image/jpeg'] || book.cover)
}

function hasChapters(book) {
  return Boolean(book.chapterCount || book.chapterList?.length || book.chapters?.length)
}

function isReaderReady(book) {
  return Boolean(getReaderUrl(book) || book.readerText || book.chapterList?.some((chapter) => chapter.content))
}

export default AdminPage
