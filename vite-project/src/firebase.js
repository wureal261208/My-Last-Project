import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

  const firebaseConfig = {
    apiKey: "AIzaSyD8m1E4x85Dow3D1PtiUpfa22N4_S1GU9w",
    authDomain: "the-final-book-project.firebaseapp.com",
    projectId: "the-final-book-project",
    storageBucket: "the-final-book-project.firebasestorage.app",
    messagingSenderId: "1067209935892",
    appId: "1:1067209935892:web:b768e2d3aa75fa42056b01",
    measurementId: "G-EH58XY55XL"
  };

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

isSupported().then((supported) => {
  if (supported) getAnalytics(app)
})
