import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    lastPage: { type: Number, default: 1 },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'userprogress' },
)

// One progress row per (user, book) pair - upsert on save instead of duplicating.
userProgressSchema.index({ user: 1, bookId: 1 }, { unique: true })

export default mongoose.models.UserProgress || mongoose.model('UserProgress', userProgressSchema)
