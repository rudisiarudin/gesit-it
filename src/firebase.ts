// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoPZ7Dcl7oPy6CGsgWFfL4JCNzQQakKCA",
  authDomain: "log-it-gesit.firebaseapp.com",
  projectId: "log-it-gesit",
  storageBucket: "log-it-gesit.firebasestorage.app",
  messagingSenderId: "788492611527",
  appId: "1:788492611527:web:a9388611d990d13fc3f3e2",
  measurementId: "G-HRC4YBZPL2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
