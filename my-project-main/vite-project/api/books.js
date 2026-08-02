import { createMongoHandler } from './_lib/mongoHandler.js'
import booksRouter from '../backend/routes/books.js'

export default createMongoHandler(booksRouter, '/api/books')