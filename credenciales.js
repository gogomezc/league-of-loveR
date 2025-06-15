import { 
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET
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

export const uploadImageToCloudinary = async (uri) => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  data.append('upload_preset', 'perfil_usuario'); // Cambia esto
  data.append('cloud_name', 'dwkn1vhj7'); // Cambia esto

  const res = await fetch('https://api.cloudinary.com/v1_1/dwkn1vhj7/image/upload', {
    method: 'POST',
    body: data,
  });
  const json = await res.json();
  return json.secure_url;
};
