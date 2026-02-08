// services\firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

// 使用你自己的配置；注意 storageBucket 必须是 *.appspot.com
const firebaseConfig = {
  apiKey: "AIzaSyC7bgoOYAOyy9CnxVnBUJbSiQMig8eKt0c",
  authDomain: "moneysplit-1dd72.firebaseapp.com",
  projectId: "moneysplit-1dd72",
  storageBucket: "moneysplit-1dd72",
  messagingSenderId: "760739551528",
  appId: "1:760739551528:web:650fd22c9de948d229d81d",
  measurementId: "G-0Q28T243ZL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 1. 导出存储实例
export const storage = getStorage(app);

/**
 * 2. 核心工具函数：上传本地图片并获取云端 URL
 * @param uri 本地图片的临时路径 (file://...)
 * @param userId 用于区分存储路径，防止文件冲突
 */
export const uploadImageAndGetUrl = async (uri: string | null, userId: string) => {
  if (!uri) return "";

  try {
    // A. 将本地 URI 转换为 Blob (二进制大型对象)
    // 这是因为 Firebase Web SDK 在 React Native 环境下处理原生文件路径需要转换
    const response = await fetch(uri);
    const blob = await response.blob();

    // B. 创建存储引用 (定义云端的文件路径和名称)
    // 路径格式：receipts/用户ID/时间戳.jpg
    const storageRef = ref(storage, `receipts/${userId}/${Date.now()}.jpg`);

    // C. 执行上传
    await uploadBytes(storageRef, blob);

    // D. 获取并返回下载 URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Upload to Firebase Storage failed:", error);
    throw error; // 抛出错误以便在 UI 层捕获
  }
};