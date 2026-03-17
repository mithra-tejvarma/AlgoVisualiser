import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIIe47NRehGZkCfZwSKcqYEOr89T9AIjc",
  authDomain: "prismalgo-studio.firebaseapp.com",
  projectId: "prismalgo-studio",
  storageBucket: "prismalgo-studio.firebasestorage.app",
  messagingSenderId: "94181907102",
  appId: "1:94181907102:web:4fde776930f47a75de798f",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
