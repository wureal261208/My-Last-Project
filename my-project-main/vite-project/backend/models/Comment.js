import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true, collection: 'comments' },
)

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema)
