import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuySxaDN1XkYL1rJ3hHOpeZWptjxKADs8",
  authDomain: "pollingsystem-56c6b.firebaseapp.com",
  projectId: "pollingsystem-56c6b",
  storageBucket: "pollingsystem-56c6b.firebasestorage.app",
  messagingSenderId: "595877005525",
  appId: "1:595877005525:web:18357b2ccfb3169273ba5c",
  measurementId: "G-K49SVJHDBG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);