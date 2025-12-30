// services/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7bgoOYAOyy9CnxVnBUJbSiQMig8eKt0c",
  authDomain: "moneysplit-1dd72.firebaseapp.com",
  projectId: "moneysplit-1dd72",
  storageBucket: "moneysplit-1dd72.firebasestorage.app",
  messagingSenderId: "760739551528",
  appId: "1:760739551528:web:650fd22c9de948d229d81d",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);