import admin from "firebase-admin";

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_CREDENTIALS_BASE64) {
      throw new Error(
        "Missing FIREBASE_CREDENTIALS_BASE64 environment variable"
      );
    }

    const json = Buffer.from(
      process.env.FIREBASE_CREDENTIALS_BASE64,
      "base64"
    ).toString("utf8");
    const creds = JSON.parse(json);

    admin.initializeApp({
      credential: admin.credential.cert(creds),
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        "marsosv7.firebasestorage.app",
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

// Export the initialized services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { db, auth, storage };
