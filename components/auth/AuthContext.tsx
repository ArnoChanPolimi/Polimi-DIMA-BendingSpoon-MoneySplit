// components\auth\AuthContext.tsx
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../../services/firebase';

// 1. 定义类型，加入 updateUsername
type Ctx = {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  updateUsername: (newUsername: string) => Promise<void>; // 新增
};

// 2. 创建 Context
const AuthCtx = createContext<Ctx>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  checkEmailVerified: async () => false,
  updateUsername: async () => {}, // 新增
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 监听用户状态
  // 监听用户状态 (修改后的逻辑)
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // 当 Auth 状态存在时，开启对 Firestore 对应用户文档的实时监听
        unsubscribeFirestore = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            // 将 Firestore 的数据（包含最新的 friends 数组）合并到 user 状态中
            const firestoreData = docSnap.data();
            const mergedUser = Object.assign(
              Object.create(Object.getPrototypeOf(firebaseUser)), 
              firebaseUser,
              { ...firestoreData } // 关键：实时同步 friends 数组
            );
            setUser(mergedUser);
          } else {
            setUser(firebaseUser);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        if (unsubscribeFirestore) unsubscribeFirestore();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // 登录
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 注册逻辑：包含存储用户名到 Firestore 且注册后自动登出
  const signup = async (email: string, password: string, username: string) => {
    // 1. 先在 Authentication 创建账号
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });

    // 2. 核心动作：立刻在 Firestore 写入用户文档
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: username, // 使用注册时填写的用户名
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
      avatar: "",
      friends: [], // 必须加上这一行！初始化为空数组
    });

    // 3. 发送验证邮件
    await sendEmailVerification(user);
    
    // 4. 根据你的业务逻辑决定是否先登出
    // await signOut(auth);
  };

  // 登出
  const logout = async () => {
    await signOut(auth);
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // 检查邮箱验证状态
  const checkEmailVerified = async () => {
    // 1. 获取当前最实时的用户实例
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // 2. 强制从服务器拉取最新状态
        await currentUser.reload();
        
        // 3. 检查重载后的属性
        if (currentUser.emailVerified) {
          // 关键：必须手动同步到 Context 状态，否则全局 User 还是旧的
          // setUser({ ...currentUser } as any); 
          const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(currentUser)), currentUser);
          setUser(updatedUser);
          return true;
        }
      } catch (error) {
        console.error("Verification check failed:", error);
      }
    }
    return false;
  };

  // 【修改后的核心功能】：修改用户名
  const updateUsername = async (newUsername: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");

    // a. 修改 Firebase Auth 服务（确保下次登录能看到新名字）
    await updateProfile(auth.currentUser, { displayName: newUsername });

    // b. 修改 Firestore 数据库（确保云端有备份，merge 模式是对的）
    // 在 updateUsername 函数内部找到 setDoc 部分
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      username: newUsername,
    }, { merge: true });

    // --- 新增：时刻覆盖更新所有好友处的 displayName ---
    try {
      const myUid = auth.currentUser.uid;
      // 1. 找到我所有的好友（读取我的红圈子集合）
      const myFriendsRef = collection(db, "users", myUid, "friends");
      const snapshot = await getDocs(myFriendsRef);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((friendDoc) => {
          const friendUid = friendDoc.id;
          // 2. 找到对方好友列表里关于“我”的文档路径
          const friendSideRef = doc(db, "users", friendUid, "friends", myUid);
          // 3. 覆盖更新
          batch.update(friendSideRef, { displayName: newUsername });
        });
        await batch.commit();
        console.log("Success: All friends' lists updated with new name.");
      }
    } catch (err) {
      console.error("Failed to sync name to friends:", err);
    }
    // ----------------------------------------------

    // c. 强制刷新逻辑
    await auth.currentUser.reload();

    // 【关键修改点】：
    // 不要只依赖解构，我们要显式地把新名字塞进状态里
    // 这样 React 绝对能检测到 user.displayName 变了，UI 才会跳变
    // const updatedUser = auth.currentUser;
    // setUser({ 
    //   ...auth.currentUser, 
    //   displayName: newUsername 
    // } as any);
    const currentUser = auth.currentUser;
    const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(currentUser)), currentUser);
    setUser(updatedUser);

    console.log("Updated username to:", newUsername);
  };

  // 3. 将所有函数放入 value 并导出
  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    checkEmailVerified,
    updateUsername // 确保它在这里！
  }), [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);