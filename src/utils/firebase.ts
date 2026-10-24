import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

// These values are public project identifiers, not secrets — they ship in the
// bundle by design. They live in .env only so each environment can point at its
// own Firebase project. Never put an Admin SDK service account key here.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Web Push certificate from Firebase console → Cloud Messaging → Web Push certificates
export const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId
);

let app: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured) return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
};

let messagingPromise: Promise<Messaging | null> | null = null;

// Messaging is unavailable in private windows, unsupported browsers and any
// non-secure origin, so every caller has to cope with null.
export const getFirebaseMessaging = (): Promise<Messaging | null> => {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      const firebaseApp = getFirebaseApp();
      if (!firebaseApp) return null;
      if (!(await isSupported())) return null;
      return getMessaging(firebaseApp);
    })().catch(() => null);
  }
  return messagingPromise;
};

// The service worker cannot read process.env, so the config rides along as query
// params — keeping staging and production switchable from .env alone.
export const serviceWorkerUrl = (): string => {
  const params = new URLSearchParams();
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
};
