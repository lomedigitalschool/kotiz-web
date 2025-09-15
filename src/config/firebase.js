import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// 🔧 Configuration des numéros de test Firebase
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Configurer les numéros de test directement
  auth.settings = {
    appVerificationDisabledForTesting: true
  };
  
  // Configurer les numéros de test avec leurs codes
  auth.settings.testPhoneNumbers = {
    '+22899974644': '974644'
  };
  
  console.log('🔧 Mode test Firebase activé avec numéros de test');
}

export default app;