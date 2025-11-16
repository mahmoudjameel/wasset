import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use Vite environment variables when available so the admin can be pointed
// to any Firebase project without changing source. Fallback to the
// existing values so existing behavior is preserved.
// Support both Vite `VITE_` vars and existing `EXPO_PUBLIC_` vars from the `.env`
// so the admin works without changing your current environment file.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAP9i2BRZsSieiXrb7N0O28QPTPLjLuXRA",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "toqsallll.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    "toqsallll",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    import.meta.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "toqsallll.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    import.meta.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "713233113931",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    import.meta.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:713233113931:web:3b3c4b56cb49dba5497ece",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
