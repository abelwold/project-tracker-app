import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyAxkjscs4U9_kx6EkXITwmI0a3IM9Hi588",
  authDomain: "bringtogether-f5014.firebaseapp.com",
  projectId: "bringtogether-f5014",
  storageBucket: "bringtogether-f5014.firebasestorage.app",
  messagingSenderId: "907396873603",
  appId: "1:907396873603:web:f4111000719fc3ba700ab6",
  measurementId: "G-5W1RYJ3DLE"
  // rest of your existing config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
