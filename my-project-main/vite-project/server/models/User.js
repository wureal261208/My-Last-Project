import mongoose from 'mongoose'

const ROLES = ['user', 'employee', 'manager', 'admin']

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    // Which Push Book shelf an employee manages. Only meaningful when role === 'employee'.
    section: { type: String, enum: ['read', 'rent', null], default: null },
    firebaseUid: { type: String, default: null },
    locked: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'users' },
)

export const USER_ROLES = ROLES
export default mongoose.models.User || mongoose.model('User', userSchema)
