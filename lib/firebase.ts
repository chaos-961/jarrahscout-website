import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase wiring, dormant until the env vars are filled in.
 *
 * Nothing calls these yet. lib/events.ts serves mock data and documents the
 * Firestore query each function replaces, so turning this on is: copy
 * .env.local.example to .env.local, paste the console values, then swap the
 * bodies in lib/events.ts.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** False until the env vars exist, which keeps builds green without a project. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;

/** Lazily initialise, and only once, so hot reload does not re-register. */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Copy .env.local.example to .env.local and fill in the values.',
    );
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export const getDb = (): Firestore => getFirestore(getFirebaseApp());
export const getStorageBucket = (): FirebaseStorage => getStorage(getFirebaseApp());
export const getAuthClient = (): Auth => getAuth(getFirebaseApp());
