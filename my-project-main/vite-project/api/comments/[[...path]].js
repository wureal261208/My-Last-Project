import { createMongoHandler } from '../_lib/mongoHandler.js'
import commentsRouter from '../../backend/routes/comments.js'

export default createMongoHandler(commentsRouter, '/api/comments')