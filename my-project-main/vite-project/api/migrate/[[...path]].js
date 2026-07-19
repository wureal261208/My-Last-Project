import { createMongoHandler } from '../_lib/mongoHandler.js'
import { ensureFirebaseAdmin } from '../../server/firebaseAdmin.js'
import migrateRouter from '../../server/routes/migrate.js'

try {
  ensureFirebaseAdmin()
} catch (error) {
  console.warn('[api/migrate] Firebase Admin not initialized yet:', error.message)
}

export default createMongoHandler(migrateRouter, '/api/migrate')
