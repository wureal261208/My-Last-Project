import mongoose from 'mongoose'

const STATUSES = ['pending', 'approved', 'declined', 'expired', 'returned']
const RENTAL_DAYS = 7 // how long access lasts once a rental is approved and delivered

const rentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    bookTitle: { type: String, required: true },

    status: { type: String, enum: STATUSES, default: 'pending', index: true },

    // Delivery / order details (cash on delivery, matches BookWorm's rental page).
    recipientName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    paymentMethod: { type: String, default: 'cod' },
    note: { type: String, default: '' },

    deliveryAt: { type: Date, default: null }, // set by manager/admin on approval
    expiresAt: { type: Date, default: null }, // deliveryAt + RENTAL_DAYS, when reading access ends
    decidedAt: { type: Date, default: null },
    decidedBy: { type: String, default: null }, // email of the manager/admin who approved/declined
  },
  { timestamps: true, collection: 'rentals' },
)

rentalSchema.methods.approve = function approve(deliveryAt, decidedByEmail) {
  this.status = 'approved'
  this.deliveryAt = deliveryAt
  this.expiresAt = new Date(deliveryAt.getTime() + RENTAL_DAYS * 24 * 60 * 60 * 1000)
  this.decidedAt = new Date()
  this.decidedBy = decidedByEmail
}

rentalSchema.methods.decline = function decline(decidedByEmail) {
  this.status = 'declined'
  this.decidedAt = new Date()
  this.decidedBy = decidedByEmail
}

// Lazily flips 'approved' rentals past their expiry date to 'expired' - called
// whenever rentals are listed, so no separate cron job is needed for this project.
rentalSchema.statics.markExpiredPastDue = async function markExpiredPastDue() {
  await this.updateMany(
    { status: 'approved', expiresAt: { $ne: null, $lt: new Date() } },
    { $set: { status: 'expired' } },
  )
}

export const RENTAL_STATUSES = STATUSES
export default mongoose.models.Rental || mongoose.model('Rental', rentalSchema)
