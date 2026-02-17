


// src/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

// ── Replace these with your real Firebase project values ─────────────────────
// Get them from: console.firebase.google.com → Project Settings → Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyBsh8r1xkb2Y7IoOAPq6jBUobO9630oYh8",
  authDomain: "sankofa-58987.firebaseapp.com",
  projectId: "sankofa-58987",
  storageBucket: "sankofa-58987.firebasestorage.app",
  messagingSenderId: "179254121308",
  appId: "1:179254121308:web:f97b92d87e33cf77caa799"
};
// ── Prevent "duplicate-app" error during Vite HMR hot reloads ────────────────
// getApps() returns existing apps — reuse if already initialised
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth          = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupWithEmail = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred;
};

export const loginWithGoogle  = () => signInWithPopup(auth, googleProvider);
export const logout            = () => signOut(auth);
export const resetPassword     = (email) => sendPasswordResetEmail(auth, email);
export const onAuthChange      = (callback) => onAuthStateChanged(auth, callback);

export default app;