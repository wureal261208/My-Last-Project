import mongoose from 'mongoose'

let connectPromise = null
let listenersAttached = false

function attachDiagnosticListeners() {
  if (listenersAttached) return
  listenersAttached = true

  // These fire regardless of whether a specific query "sees" the error in
  // time, so the real reason (bad auth, DNS/SRV failure, IP not whitelisted,
  // etc.) always shows up in the terminal instead of a generic
  // "buffering timed out" message on whatever request happened to be waiting.
  mongoose.connection.on('error', (error) => {
    console.error('[mongo] connection error:', error.message)
  })
  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] disconnected')
  })
  mongoose.connection.on('connected', () => {
    console.log(`[mongo] connected to database "${mongoose.connection.name}"`)
  })
}

/**
 * Connects to MongoDB Atlas using MONGODB_URI from the environment.
 * Never hardcode the connection string in source - it belongs in `.env`
 * (which is already listed in .gitignore) or in your hosting provider's
 * environment variable settings.
 */
export function connectMongo() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection)
  if (connectPromise) return connectPromise

  const uri = process.env.MONGODB_URI
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI is not set. Add it to server/.env or your environment.'))
  }

  attachDiagnosticListeners()

  connectPromise = mongoose
    .connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'schema',
      serverSelectionTimeoutMS: 10000,
    })
    .then((connection) => connection)
    .catch((error) => {
      connectPromise = null
      console.error('[mongo] connection failed:', error.message)
      throw error
    })

  return connectPromise
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

export default mongoose
