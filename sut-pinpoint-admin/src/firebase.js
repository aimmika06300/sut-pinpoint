import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ดูค่าพวกนี้ได้จาก Firebase Console -> Project Settings -> General -> Web App
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sut-pinpoint.firebaseapp.com",
  projectId: "sut-pinpoint",
  storageBucket: "sut-pinpoint.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);