import '../loadEnv.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

const email = process.argv[2]

async function run() {
  if (!email) {
    console.error('Usage: node server/scripts/makeAdmin.js someone@example.com')
    process.exit(1)
  }

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set - add it to server/.env first.')

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'schema' })

  const user = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $set: { role: 'admin' } },
    { new: true },
  )

  if (!user) {
    console.error(`No user found with email ${email}. Register that account first (POST /api/auth/register), then run this again.`)
  } else {
    console.log(`[makeAdmin] ${user.email} is now an admin. Log in again to get a fresh access token with the new role.`)
  }

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('[makeAdmin] failed:', error)
  process.exit(1)
})
