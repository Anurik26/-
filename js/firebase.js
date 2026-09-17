// Firebase configuration for Anime Hub
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWpOSjr27XR_Mz4TVQLVsv3wL2o17wJlE",
  authDomain: "anime-hub-7f71f.firebaseapp.com",
  projectId: "anime-hub-7f71f",
  storageBucket: "anime-hub-7f71f.firebasestorage.app",
  messagingSenderId: "641212650930",
  appId: "1:641212650930:web:4300b435c315e4dd1240ab",
  measurementId: "G-4ZYGSR5N90"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
