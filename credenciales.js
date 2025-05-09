// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUPyQUsjshtFV_6gujyDgYaQC57_WJehQ",
  authDomain: "league-of-love-bdbc9.firebaseapp.com",
  projectId: "league-of-love-bdbc9",
  storageBucket: "league-of-love-bdbc9.firebasestorage.app",
  messagingSenderId: "185188523061",
  appId: "1:185188523061:web:ec27d3f58099e23b2e657c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);   

export { auth, db, storage };


