import { createMongoHandler } from '../_lib/mongoHandler.js'
import rentalsRouter from '../../server/routes/rentals.js'

export default createMongoHandler(rentalsRouter, '/api/rentals')
