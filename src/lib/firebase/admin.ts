import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Firebase Admin chỉ chạy server-side: Route Handler, Server Action, Cloud Functions tooling.
const hasServiceAccount = Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

const adminApp =
  getApps()[0] ??
  initializeApp(
    hasServiceAccount
      ? {
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "the-final-book-project",
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
          }),
          storageBucket:
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
            "the-final-book-project.firebasestorage.app"
        }
      : {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "the-final-book-project",
          storageBucket:
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
            "the-final-book-project.firebasestorage.app"
        }
  );

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
