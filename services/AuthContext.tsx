import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  /** 注册：发送验证邮件，并立即登出 */
  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await signOut(auth); // 🔥 不自动登录
    alert("Verification email sent. Please verify your email before logging in.");
    router.replace("/auth/login");
  };

  /** 登录：必须验证邮箱 */
  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cred.user.reload(); // 🔄 刷新用户状态
    if (!cred.user.emailVerified) {
      await signOut(auth);
      throw new Error("Email not verified yet. Please click the link in your inbox.");
    }
    setUser(cred.user);
    router.replace("/");
  };

  /** 注销 */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.replace("/auth/login");
  };

  /** 刷新当前用户状态（可用于点击“I HAVE VERIFIED”按钮） */
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
