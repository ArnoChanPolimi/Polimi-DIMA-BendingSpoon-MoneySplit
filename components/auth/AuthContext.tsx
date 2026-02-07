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
import { doc, setDoc } from 'firebase/firestore';
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
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 登录
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 注册逻辑：包含存储用户名到 Firestore 且注册后自动登出
  const signup = async (email: string, password: string, username: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // 同步更新 Auth Profile
    await updateProfile(newUser, { displayName: username });

    // 存储到 Firestore 云端
    await setDoc(doc(db, 'users', newUser.uid), {
      uid: newUser.uid,
      email: newUser.email,
      username: username,
      createdAt: new Date().toISOString(),
    });

    await sendEmailVerification(newUser);
    await signOut(auth); // 强制登出，符合你的业务逻辑
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
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  // 【修改后的核心功能】：修改用户名
  const updateUsername = async (newUsername: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");

    // a. 修改 Firebase Auth 服务（确保下次登录能看到新名字）
    await updateProfile(auth.currentUser, { displayName: newUsername });

    // b. 修改 Firestore 数据库（确保云端有备份，merge 模式是对的）
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      username: newUsername
    }, { merge: true });

    // c. 强制刷新逻辑
    await auth.currentUser.reload();

    // 【关键修改点】：
    // 不要只依赖解构，我们要显式地把新名字塞进状态里
    // 这样 React 绝对能检测到 user.displayName 变了，UI 才会跳变
    setUser({ 
      ...auth.currentUser, 
      displayName: newUsername 
    } as any); 

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