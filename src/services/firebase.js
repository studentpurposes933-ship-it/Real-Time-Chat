import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const DEFAULT_CONFIG = {
  apiKey: "AIzaSyBRvhMbqWRedjvHU983HOc7el1nLzE8yuw",
  authDomain: "real-time-chat-1e054.firebaseapp.com",
  projectId: "real-time-chat-1e054",
  storageBucket: "real-time-chat-1e054.firebasestorage.app",
  messagingSenderId: "469569754064",
  appId: "1:469569754064:web:e4f1c3f3c5c4845c995fd5",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
};

// Check if valid Firebase configuration exists
export const checkFirebaseConfig = () => {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
  ) {
    return {
      isValid: false,
      missingKeys: ['VITE_FIREBASE_API_KEY'],
      message: 'Firebase configuration is missing or invalid.',
    };
  }

  return { isValid: true, missingKeys: [], message: '' };
};

// Initialize Firebase App, Auth, and Firestore
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
