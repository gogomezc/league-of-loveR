// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsk2TXiz4p5S_ZVp3-Vet5FoJrNktBmzg",
  authDomain: "league-of-lover.firebaseapp.com",
  projectId: "league-of-lover",
  storageBucket: "league-of-lover.firebasestorage.app",
  messagingSenderId: "441524344258",
  appId: "1:441524344258:web:a4f58f05f6ae7315a5725b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };