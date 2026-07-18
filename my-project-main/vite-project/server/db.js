import mongoose from 'mongoose'

let connectPromise = null

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

  connectPromise = mongoose
    .connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'schema',
      serverSelectionTimeoutMS: 15000,
    })
    .then((connection) => {
      console.log(`[mongo] connected to database "${connection.connection.name}"`)
      return connection
    })
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
