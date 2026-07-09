# BookWorm Online Book Store and Reader

BookWorm is a Next.js 15 web application for selling books and reading books online. The app uses Project Gutenberg-style metadata from the Kaggle dataset: https://www.kaggle.com/datasets/lokeshparab/gutenberg-books-and-metadata-2025.

The interface is written in English across all pages so the product can work as an international version.

## Overview

BookWorm supports two separate access models:

```text
System roles:
- Admin
- Manager
- Employee
- Anonymous

Account types:
- Normal
- VIP
```

The Kaggle Gutenberg dataset is used as the preferred book metadata source. Imported records are normalized into a common book shape:

```text
bookId
gutenbergId
title
authors
subjects
language
coverUrl
readerUrl
downloadCount
accessType
chapterList
```

Books are separated into two non-overlapping publishing targets:

```text
free-to-read
for-sale
```

A book can be published as a free reader title or a store title, but never both at the same time.

Long account values are displayed as snippet text blocks in the UI, for example:

```text
Email:
reader@example.com

Firebase UID:
eAeLVTMuloQpm9UVoUPeHGLsIVG2

Phone:
+1 555 0100
```

## Main Page Flow

The Main page is the public landing/catalog experience. It displays highlighted Gutenberg books first, then recommended books and category groups.

Each book card shows:

```text
Cover image
Title
Author
Category or subject
Access tag: Free read / For sale
Rating
Review count
View count
```

Featured book logic:

```text
1. Prefer books imported from the Kaggle Gutenberg dataset.
2. Rank by download_count, local view count, and category completeness.
3. Display high-ranking titles in Featured / Popular sections.
4. Keep free-to-read and for-sale labels visible on every card.
```

Search and filtering:

```text
Search fields:
- title
- author
- subject

Filter fields:
- category
- language
- accessType
```

Anonymous users can browse and preview, but buying actions redirect them to authentication.

## Detail Page Flow

The Detail page explains one selected book and connects the user to the reader.

Displayed sections:

```text
Book cover
Title
Author
Language
Rating
Review count
View count
Description
Access type
Chapter list
Reader comments
More books
```

Chapter behavior:

```text
1. The system reads chapterList if the book has explicit chapters.
2. If chapterList is missing, the reader builds generated chapter slices from metadata or text.
3. Each chapter item links to the Read page with a selected chapter.
4. Clicking Chapter 1 opens only Chapter 1 in the reader.
```

Comment behavior:

```text
Normal and VIP users:
- can post comments
- can sort comments by newest or oldest

Anonymous users:
- can view the detail page
- can preview content
- are prompted to log in for member actions
```

More books logic:

```text
1. Exclude the current book.
2. Prefer matching category, author, or subject tags.
3. Boost books with higher local views.
4. Use download_count as a fallback popularity signal.
```

## Read Page Flow

The Read page supports sliced chapters. It does not render the full book at once.

Core rule:

```text
One selected chapter is displayed at a time.
```

Sliced chapter flow:

```text
User selects Chapter 1
-> Reader receives bookId and selected chapter start
-> Reader resolves the active chapter index
-> Reader loads only that chapter body
-> Reader displays Chapter 1
-> User clicks Next
-> Reader moves to Chapter 2
```

The reader can build chapter content from:

```text
1. Admin-provided chapter content.
2. Full plain text split by chapter headings.
3. Generated chapter slices when metadata is limited.
```

The Next button:

```text
If next chapter exists:
  open next chapter

If user is Anonymous and preview limit is exceeded:
  show login prompt

If current chapter is the final chapter:
  show finished state
```

Progress saving:

```text
userId
bookId
currentChapter
currentChapterPage
progressPercent
updatedAt
```

Anonymous preview:

```text
Anonymous users can preview limited chapters only.
Reading progress is not persisted for anonymous sessions.
```

## Account Management Flow

The Account page shows member identity, membership status, purchase history, reader preferences, and security actions.

Long values are rendered as snippet text blocks:

```text
Email:
reader@example.com

Account ID:
firebase-user-id
```

Displayed sections:

```text
Profile identity
Account type: Normal / VIP
Email snippet
Account ID snippet
Purchase history
Reader mode
Font size
Website theme
Password reset
```

Normal account behavior:

```text
Can buy books
Can read free books
Can read purchased books
Can save reading progress
Does not receive VIP coupons
```

VIP account behavior:

```text
Can buy multiple books
Receives VIP tag
Receives discount coupons
Receives special store offers
Can save reading progress
```

## VIP Promotions Flow

The VIP Promotions page shows coupons and special offers.

VIP users see active offers:

```text
VIP15:
15% off all book orders

BUNDLE30:
Bundle discount for 3+ books

WEEKEND:
Weekend reader reward
```

Normal users see locked offers with an explanation that VIP status is required.

Anonymous users can preview the promotion page, but they must log in before coupons can be used.

Coupon application rule:

```text
if accountType === "vip":
  apply eligible discount
else:
  show normal checkout total
```

## Admin Dashboard Flow

The Admin Dashboard is available to Admin, Manager, and Employee roles. It always starts with a profile and permission panel.

Profile and permission panel:

```text
Signed-in profile
Email snippet
Firebase UID snippet
Role
Account type
Permission scope
```

Admin book management:

```text
Create book
Edit book
Remove book
Set publish target
Set status
Add chapter slices
Preview detail page
```

Publishing targets:

```text
free-to-read:
  visible in reading catalog

for-sale:
  visible in store catalog
```

No-duplicate rule:

```text
The same bookId must not be published as both free-to-read and for-sale.
```

Manager management:

```text
Admin can create managers
Admin can delete managers
Admin can convert manager to employee
Admin can convert employee to manager
```

Manager specialties:

```text
Reading books manager
Sale books manager
```

Employee management:

```text
Admin or manager can assign employee work
Dashboard displays employee task reports
Employee records show assigned manager
Employee can view assigned profile and permission state
```

Staff account data uses snippet text for long values:

```text
Email:
team.member@example.com
```

## Rules

Anonymous:

```text
Can browse catalog
Can view detail pages
Can preview limited chapters
Cannot buy books
Cannot permanently save reading progress
Cannot use VIP coupons
```

Normal:

```text
Can buy books
Can read free books
Can read purchased books
Can comment
Can save reading progress
Does not receive VIP discounts
```

VIP:

```text
Can buy multiple books
Can use coupons
Receives visible VIP tag
Can read free and purchased books
Can save reading progress
```

Book publishing:

```text
free-to-read books and for-sale books must not overlap.
```

Interface language:

```text
All visible website text should remain in English.
```

## Extensibility

The system is structured so future features can be added without rewriting the core flow.

Recommended extension points:

```text
src/legacy/utils/bookUtils.js
  Book metadata normalization, access type, rating, review count.

src/legacy/utils/chapterUtils.js
  Chapter slicing and generated chapter fallback.

src/legacy/components/pages/ReaderPage.jsx
  Sliced chapter reader behavior and progress persistence.

src/legacy/components/pages/AdminPage.jsx
  Book publishing and staff permission workflows.

scripts/import-gutenberg.mjs
  Kaggle Gutenberg metadata import into Firestore.
```

Before adding new product features such as real payment processing, automatic VIP subscription billing, EPUB parsing, PDF rendering, or AI recommendations, ask the project owner first and document the new flow.

## Development

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Type-check:

```bash
npm.cmd run typecheck
```

Build:

```bash
npm.cmd run build
```
