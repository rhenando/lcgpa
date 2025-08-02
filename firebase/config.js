// src/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCXSCOBwTUUxWIv6z0n19Xj6dVQp7Swu2Y",
  authDomain: "marsos-82cb1.firebaseapp.com",
  projectId: "marsos-82cb1",
  storageBucket: "marsos-82cb1.appspot.com",
  messagingSenderId: "935923725562",
  appId: "1:935923725562:web:486dd83dcfb953685f8543",
};
// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// --- UPDATED APP CHECK INITIALIZATION ---
// 1. Declare appCheck here so it's in the top-level scope
let appCheck;

// 2. Initialize it inside the browser-only check
if (typeof window !== "undefined") {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      "6LeC8IsrAAAAABvOoadVusGXeDS2KGU4tcJ2FQud"
    ),
    isTokenAutoRefreshEnabled: true,
  });
}
// ------------------------------------

// Initialize other Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Export all services, including the new appCheck instance
export { app, auth, db, functions, storage, appCheck };
