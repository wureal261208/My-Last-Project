import { createMongoHandler } from '../_lib/mongoHandler.js'
import usersRouter from '../../server/routes/users.js'

export default createMongoHandler(usersRouter, '/api/users')
