import { getAnalytics, isSupported } from 'firebase/analytics'
import { auth, db, firebaseApp } from '@/lib/firebase/client'

// Re-export Firebase instance từ Next config để frontend cũ dùng chung một nguồn cấu hình.
export const app = firebaseApp
export { auth, db }

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app)
  })
}
