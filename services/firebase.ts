import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ✅ 使用你自己的配置；注意 storageBucket 必须是 *.appspot.com
const firebaseConfig = {
  apiKey: 'AIzaSyBWv9gbK9fV_e9X9ZOsG9kk_2qjKu3hJwU',
  authDomain: 'moneysplit-2025.firebaseapp.com',
  projectId: 'moneysplit-2025',
  storageBucket: 'moneysplit-2025.appspot.com',
  messagingSenderId: '567515513530',
  appId: '1:567515513530:web:fff7f10e69d1a63a657883',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);