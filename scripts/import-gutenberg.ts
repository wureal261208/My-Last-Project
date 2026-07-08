import "dotenv/config";
import fs from "node:fs";
import { parse } from "csv-parse";
import { adminDb } from "../src/lib/firebase/admin";

const csvPath = process.argv[2];

if (!csvPath) {
  throw new Error("Usage: npm run import:gutenberg ./data/gutenberg.csv");
}

const batchSize = 400;
let pending: FirebaseFirestore.WriteBatch | null = null;
let count = 0;

function getBatch() {
  if (!pending) pending = adminDb.batch();
  return pending;
}

async function commitBatch() {
  if (!pending) return;
  await pending.commit();
  pending = null;
}

fs.createReadStream(csvPath)
  .pipe(parse({ columns: true, skip_empty_lines: true }))
  .on("data", async (row) => {
    const gutenbergId = String(row.gutenberg_id || row.id || row.book_id || "").trim();
    if (!gutenbergId) return;

    const ref = adminDb.collection("books").doc(`gutenberg-${gutenbergId}`);
    getBatch().set(
      ref,
      {
        gutenbergId,
        title: row.title || "Untitled",
        authors: row.author ? String(row.author).split(";").map((name) => name.trim()) : [],
        language: row.language || "en",
        subjects: row.subjects ? String(row.subjects).split(";").map((item) => item.trim()) : [],
        description: row.summary || row.description || "",
        coverUrl: row.cover_url || `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`,
        fileUrl: row.epub_url || `https://www.gutenberg.org/ebooks/${gutenbergId}.epub3.images`,
        fileType: "epub",
        price: 0,
        isFree: true,
        status: "published",
        source: "project-gutenberg",
        updatedAt: new Date()
      },
      { merge: true }
    );

    count += 1;
    if (count % batchSize === 0) await commitBatch();
  })
  .on("end", async () => {
    await commitBatch();
    console.log(`Imported ${count} Gutenberg books`);
  });
