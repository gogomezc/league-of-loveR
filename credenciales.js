import { 
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:              FIREBASE_API_KEY,
  authDomain:          FIREBASE_AUTH_DOMAIN,
  projectId:           FIREBASE_PROJECT_ID,
  messagingSenderId:   FIREBASE_MESSAGING_SENDER_ID,
  appId:               FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Exporta los servicios que uses
export const auth    = getAuth(app);
export const db      = getFirestore(app);
