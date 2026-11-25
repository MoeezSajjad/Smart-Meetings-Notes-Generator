// Firebase initialization and auth helper
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LOCAL_KEY = "smng_user";

export const signupWithEmail = async (email, password) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;
  await sendEmailVerification(user);
  const payload = { uid: user.uid, email: user.email };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  return user;
};

export const loginWithEmail = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const user = userCred.user;
  const payload = { uid: user.uid, email: user.email };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  return user;
};

export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem(LOCAL_KEY);
};

export const subscribeAuth = (cb) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ uid: user.uid, email: user.email }));
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }
    if (cb) cb(user);
  });
};

export const getLocalUser = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// update profile:
export const updateProfile = async (updates) => {
  if (!auth.currentUser) throw new Error("No user is currently logged in.");
  await firebaseUpdateProfile(auth.currentUser, updates);
};

export default auth;
