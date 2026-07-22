import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import { connectMongo, isMongoConnected } from './db.js'
import { ensureFirebaseAdmin } from './firebaseAdmin.js'
import { startPollingSync } from './sync/pollingSync.js'
import { corsOptions } from './utils/cors.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import booksRouter from './routes/books.js'
import rentalsRouter from './routes/rentals.js'
import commentsRouter from './routes/comments.js'
import migrateRouter from './routes/migrate.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors(corsOptions()))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mongoConnected: isMongoConnected() })
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)
app.use('/api/rentals', rentalsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/migrate', migrateRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('[server] unhandled error:', error)
  res.status(500).json({ error: 'Internal server error.' })
})

connectMongo()
  .then(() => {
    try {
      ensureFirebaseAdmin()
      startPollingSync({ intervalMs: Number(process.env.SYNC_INTERVAL_MS) || 15000 })
    } catch (error) {
      console.warn('[server] polling sync not started (this is fine if you are not using Firestore anymore):', error.message)
    }
  })
  .catch((error) => {
    console.error('[server] starting without a Mongo connection:', error.message)
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`[server] BookWorm API listening on http://localhost:${PORT}`)
    })
  })
