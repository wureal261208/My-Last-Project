import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/import-gutenberg.mjs ./data/gutenberg.csv");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "the-final-book-project",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  })
});

const db = getFirestore();
const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const [headers, ...items] = rows;

let batch = db.batch();
let count = 0;

for (const item of items) {
  const row = Object.fromEntries(headers.map((key, index) => [key, item[index] || ""]));
  const gutenbergId = row.gutenberg_id || row.id || row.book_id;
  if (!gutenbergId) continue;

  const ref = db.collection("books").doc(`gutenberg-${gutenbergId}`);
  batch.set(
    ref,
    {
      gutenbergId,
      title: row.title || "Untitled",
      authors: splitValue(row.author || row.authors),
      subjects: splitValue(row.subjects || row.bookshelves),
      language: row.language || "en",
      coverUrl:
        row.cover_url ||
        `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`,
      epubUrl: row.epub_url || `https://www.gutenberg.org/ebooks/${gutenbergId}.epub3.images`,
      source: "kaggle-gutenberg",
      status: "published",
      importedAt: new Date().toISOString()
    },
    { merge: true }
  );

  count += 1;
  if (count % 400 === 0) {
    await batch.commit();
    batch = db.batch();
  }
}

await batch.commit();
console.log(`Imported ${count} books`);

function splitValue(value) {
  return String(value || "")
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((item) => item.some(Boolean));
}
