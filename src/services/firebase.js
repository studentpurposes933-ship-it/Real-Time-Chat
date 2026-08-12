import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if all required environment variables are present and non-empty
export const checkFirebaseConfig = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key] || import.meta.env[key].trim() === '');
  
  if (missingKeys.length > 0) {
    return {
      isValid: false,
      missingKeys,
      message: `Firebase configuration is missing in .env file: ${missingKeys.join(', ')}. Please update .env with valid Firebase credentials.`,
    };
  }

  return { isValid: true, missingKeys: [], message: '' };
};

// Initialize Firebase only if valid config exists or attempt standard init
let app;
let auth;
let db;

const configCheck = checkFirebaseConfig();

if (configCheck.isValid) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
