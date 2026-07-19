import { createMongoHandler } from '../_lib/mongoHandler.js'
import booksRouter from '../../server/routes/books.js'

export default createMongoHandler(booksRouter, '/api/books')
