// server/src/firebase/admin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is missing");
    throw new Error("Firebase Admin not configured");
  }
  const creds = JSON.parse(raw);
  // private_key in env loses newlines — fix them
  if (creds.private_key?.includes("\\n")) {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export const firebaseAdmin = admin;
