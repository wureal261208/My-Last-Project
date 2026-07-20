import '../loadEnv.js'
import mongoose from 'mongoose'
import Book from '../models/Book.js'

const sampleBooks = [
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    description: 'A witty novel of manners following Elizabeth Bennet as she navigates love, class, and first impressions in Regency England.',
    usageType: 'read',
    source: 'seed',
  },
  {
    title: 'Frankenstein',
    author: 'Mary Shelley',
    cover: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    description: "Victor Frankenstein's obsession with creating life leads to a haunting reckoning with his own creation.",
    usageType: 'read',
    source: 'seed',
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    cover: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
    description: 'Twelve classic mysteries solved by the world\'s most famous detective and his loyal companion, Dr. Watson.',
    usageType: 'both',
    source: 'seed',
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    cover: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',
    description: 'Jonathan Harker\'s journey to Transylvania unravels into a battle against the undead Count Dracula.',
    usageType: 'rent',
    source: 'seed',
  },
  {
    title: 'Moby-Dick',
    author: 'Herman Melville',
    cover: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg',
    description: "Captain Ahab's obsessive hunt for the white whale that took his leg, narrated by the sailor Ishmael.",
    usageType: 'read',
    source: 'seed',
  },
  {
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    cover: 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg',
    description: "A man's portrait ages and corrupts in his place while he pursues a life of unchecked hedonism.",
    usageType: 'both',
    source: 'seed',
  },
]

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set - add it to server/.env first.')

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'schema' })
  console.log('[seed] connected to MongoDB')

  let created = 0
  let updated = 0

  for (const sample of sampleBooks) {
    const existing = await Book.findByTitle(sample.title)
    if (existing) {
      await Book.updateOne({ _id: existing._id }, { $set: sample })
      updated += 1
    } else {
      await Book.create(sample)
      created += 1
    }
  }

  console.log(`[seed] done - ${created} created, ${updated} updated (${sampleBooks.length} total sample books)`)
  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('[seed] failed:', error)
  process.exit(1)
})
