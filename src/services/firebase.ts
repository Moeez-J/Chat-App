// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFFlK6cfvfqp5AYbYGjs5QefDjFeeOjBQ",
  authDomain: "chatsys-ec32c.firebaseapp.com",
  projectId: "chatsys-ec32c",
  storageBucket: "chatsys-ec32c.appspot.com",
  messagingSenderId: "551317622763",
  appId: "1:551317622763:web:108b50c99561dd9faf13ae",
  measurementId: "G-9XSLN4CF2J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app, "gs://chatsys-ec32c.appspot.com");
export const analytics = getAnalytics(app); // Optional: Analytics

// Set persistence for authentication
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});
