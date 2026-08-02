import '../loadEnv.js'
import mongoose from 'mongoose'
import Book from '../models/Book.js'

// Picks 30 well-known titles out of the ~75k imported Gutenberg catalog and
// flips their `usageType` from the default 'none' to 'read' or 'rent', so
// they actually show up as readable/rentable on the site instead of just
// sitting in the catalog as inert metadata.
//
// Every { id, title } pair below was looked up directly in the user's own
// gutenberg_metadata.csv (matched on "Etext Number") - not guessed - so the
// Etext Number reliably points at the right book in their imported data.
const picks = [
  { id: 1342, title: 'Pride and Prejudice', usageType: 'read' },
  { id: 84, title: 'Frankenstein; Or, The Modern Prometheus', usageType: 'rent' },
  { id: 11, title: "Alice's Adventures in Wonderland", usageType: 'read' },
  { id: 1661, title: 'The Adventures of Sherlock Holmes', usageType: 'rent' },
  { id: 76, title: 'Adventures of Huckleberry Finn', usageType: 'read' },
  { id: 98, title: 'A Tale of Two Cities', usageType: 'rent' },
  { id: 2489, title: 'Moby Dick; Or, The Whale', usageType: 'read' },
  { id: 345, title: 'Dracula', usageType: 'rent' },
  { id: 174, title: 'The Picture of Dorian Gray', usageType: 'read' },
  { id: 42, title: 'The Strange Case of Dr. Jekyll and Mr. Hyde', usageType: 'rent' },
  { id: 35, title: 'The Time Machine', usageType: 'read' },
  { id: 1400, title: 'Great Expectations', usageType: 'rent' },
  { id: 2600, title: 'War and Peace', usageType: 'read' },
  { id: 1399, title: 'Anna Karenina', usageType: 'rent' },
  { id: 2554, title: 'Crime and Punishment', usageType: 'read' },
  { id: 74, title: 'The Adventures of Tom Sawyer, Complete', usageType: 'rent' },
  { id: 514, title: 'Little Women', usageType: 'read' },
  { id: 36, title: 'The War of the Worlds', usageType: 'rent' },
  { id: 219, title: 'Heart of Darkness', usageType: 'read' },
  { id: 768, title: 'Wuthering Heights', usageType: 'rent' },
  { id: 1260, title: 'Jane Eyre: An Autobiography', usageType: 'read' },
  { id: 158, title: 'Emma', usageType: 'rent' },
  { id: 1727, title: 'The Odyssey', usageType: 'read' },
  { id: 5200, title: 'Metamorphosis', usageType: 'rent' },
  { id: 4300, title: 'Ulysses', usageType: 'read' },
  { id: 2199, title: 'The Iliad', usageType: 'rent' },
  { id: 2680, title: 'Meditations', usageType: 'read' },
  { id: 150, title: 'The Republic', usageType: 'rent' },
  { id: 981, title: 'Beowulf', usageType: 'read' },
  { id: 46, title: 'A Christmas Carol in Prose; Being a Ghost Story of Christmas', usageType: 'rent' },
]

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set - add it to backend/.env first.')

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'schema' })
  console.log('[publish] connected to MongoDB')

  let updated = 0
  const notFound = []

  for (const pick of picks) {
    // The imported CSV's "Etext Number" column can land in Mongo as either
    // a Number or a String depending on how it was imported - match both.
    const result = await Book.updateOne(
      { $or: [{ 'Etext Number': pick.id }, { 'Etext Number': String(pick.id) }] },
      { $set: { usageType: pick.usageType } },
    )

    if (result.matchedCount > 0) {
      updated += 1
      console.log(`[publish] #${pick.id} "${pick.title}" -> ${pick.usageType}`)
    } else {
      notFound.push(pick)
    }
  }

  console.log(`\n[publish] done - ${updated}/${picks.length} books updated.`)
  if (notFound.length) {
    console.log('[publish] not found in your "books" collection (skipped):')
    notFound.forEach((pick) => console.log(`  - #${pick.id} "${pick.title}"`))
  }

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('[publish] failed:', error)
  process.exit(1)
})
