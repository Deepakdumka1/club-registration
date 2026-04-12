import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHrxSwR33Qd42jBa0y3rMJVW8y920SBQQ",
  authDomain: "club-registration-f42be.firebaseapp.com",
  projectId: "club-registration-f42be",
  storageBucket: "club-registration-f42be.firebasestorage.app",
  messagingSenderId: "1002417127032",
  appId: "1:1002417127032:web:36f079838857d55b1df78d",
  measurementId: "G-MZ6JKZQXGN"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
