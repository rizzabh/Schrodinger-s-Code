// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPlmLxeFyGLiQRVOrQxMkdwnyjjn2B9SY",
  authDomain: "schrodinger-e1071.firebaseapp.com",
  projectId: "schrodinger-e1071",
  storageBucket: "schrodinger-e1071.firebasestorage.app",
  messagingSenderId: "199857986237",
  appId: "1:199857986237:web:b8ea82c1a7592d4fc9b5d4",
  measurementId: "G-VP63V5S1ZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
export { storage };