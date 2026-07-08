# Lumen Books

Fullstack ebook marketplace demo with Next.js 15, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Storage, EPUB/PDF reader, role dashboards and Gutenberg import script.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Firebase

Copy `.env.example` to `.env.local` and fill your Firebase values. The app has demo data, so the UI can run before Firebase is fully configured.

## Useful pages

- `/` home
- `/catalog` catalog
- `/books/gutenberg-1342` book detail
- `/reader/gutenberg-1342` EPUB reader
- `/admin` dashboard
- `/admin/books` book management
- `/login` Firebase auth form

## Import Gutenberg CSV

```bash
npm run import:gutenberg ./data/gutenberg.csv
```
