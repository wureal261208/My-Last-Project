import express from 'express'
import cors from 'cors'
import { connectMongo } from '../backend/db.js'
import { corsOptions } from '../backend/utils/cors.js'
import authRouter from '../backend/routes/auth.js'
import usersRouter from '../backend/routes/users.js'
import booksRouter from '../backend/routes/books.js'
import rentalsRouter from '../backend/routes/rentals.js'
import commentsRouter from '../backend/routes/comments.js'
import migrateRouter from '../backend/routes/migrate.js'

const app = express()
app.use(cors(corsOptions()))
app.use(express.json({ limit: '2mb' }))

app.use(async (req, res, next) => {
  try {
    await connectMongo()
    next()
  } catch (error) {
    res.status(500).json({ error: 'Could not connect to MongoDB.', detail: error.message })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)
app.use('/api/rentals', rentalsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/migrate', migrateRouter)

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/books', booksRouter)
app.use('/rentals', rentalsRouter)
app.use('/comments', commentsRouter)
app.use('/migrate', migrateRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.', path: req.url, method: req.method })
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('[api] unhandled error:', error)
  res.status(500).json({ error: 'Internal server error.', detail: error?.message })
})

export default app