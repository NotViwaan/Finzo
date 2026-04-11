
import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

// ── Login with Email & Password ──
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}


export async function signupWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
}


export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}


export async function logout() {
  return signOut(auth);
}


export function getCurrentUser() {
  return auth.currentUser;
}


export function requireAuth(redirectTo = 'login.html') {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = redirectTo;
      } else {
        window.__finzoUserId = user.uid;
        resolve(user);
      }
    });
  });
}


export function redirectIfLoggedIn(redirectTo = 'dashboard.html') {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        window.location.href = redirectTo;
      } else {
        resolve(null);
      }
    });
  });
}

export { auth, onAuthStateChanged };
