import { createMongoHandler } from '../_lib/mongoHandler.js'
import commentsRouter from '../../server/routes/comments.js'

export default createMongoHandler(commentsRouter, '/api/comments')
