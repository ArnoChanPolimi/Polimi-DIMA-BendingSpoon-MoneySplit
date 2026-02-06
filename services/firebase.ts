import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 使用你自己的配置；注意 storageBucket 必须是 *.appspot.com
const firebaseConfig = {
  apiKey: "AIzaSyC7bgoOYAOyy9CnxVnBUJbSiQMig8eKt0c",
  authDomain: "moneysplit-1dd72.firebaseapp.com",
  projectId: "moneysplit-1dd72",
  storageBucket: "moneysplit-1dd72.firebasestorage.app",
  messagingSenderId: "760739551528",
  appId: "1:760739551528:web:650fd22c9de948d229d81d",
  measurementId: "G-0Q28T243ZL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);