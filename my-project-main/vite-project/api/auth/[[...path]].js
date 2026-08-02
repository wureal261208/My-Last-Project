import { createMongoHandler } from '../_lib/mongoHandler.js'
import authRouter from '../../backend/routes/auth.js'

export default createMongoHandler(authRouter, '/api/auth')