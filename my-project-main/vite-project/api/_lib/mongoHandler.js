import express from 'express'
import cors from 'cors'
import { connectMongo } from '../../server/db.js'

/**
 * Wraps one of our existing Express routers (server/routes/*.js) so it can
 * run as a Vercel serverless function - no separate always-on server needed.
 * Mongoose connections are cached across warm invocations by connectMongo().
 *
 * basePath must match the file's location under /api, e.g. a router mounted
 * here at '/api/users' handles requests coming into api/users/[...path].js.
 */
export function createMongoHandler(router, basePath) {
  const app = express()
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }))
  app.use(express.json({ limit: '2mb' }))

  app.use(async (req, res, next) => {
    try {
      await connectMongo()
      next()
    } catch (error) {
      res.status(500).json({ error: 'Could not connect to MongoDB.', detail: error.message })
    }
  })

  app.use(basePath, router)

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found.' })
  })

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error(`[api${basePath}] unhandled error:`, error)
    res.status(500).json({ error: 'Internal server error.' })
  })

  return app
}
