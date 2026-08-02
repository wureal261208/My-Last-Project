import { createMongoHandler } from './_lib/mongoHandler.js'
import usersRouter from '../backend/routes/users.js'

export default createMongoHandler(usersRouter, '/api/users')