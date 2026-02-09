// services/AuthContext.tsx
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, uploadImageAndGetUrl } from "./firebase";

// 用户头像类型
export interface UserAvatar {
  type: "default" | "color" | "custom";
  value: string; // avatar_id / color hex / image URL
}

interface AuthContextType {
  user: User | null;
  userAvatar: UserAvatar | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUsername: (name: string) => Promise<void>;
  updateAvatar: (avatar: UserAvatar) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userAvatar: null,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUsername: async () => {},
  updateAvatar: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userAvatar, setUserAvatar] = useState<UserAvatar | null>(null);

  // 从 Firestore 加载用户头像
  const loadUserAvatar = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.avatar) {
          setUserAvatar(data.avatar);
        } else {
          setUserAvatar({ type: "color", value: "#3b82f6" });
        }
      } else {
        setUserAvatar({ type: "color", value: "#3b82f6" });
      }
    } catch (e) {
      console.error("Failed to load user avatar:", e);
      setUserAvatar({ type: "color", value: "#3b82f6" });
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        loadUserAvatar(u.uid);
      } else {
        setUserAvatar(null);
      }
    });
  }, []);

  /** 注册：发送验证邮件，并立即登出 */
  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    
    // 创建用户文档，设置默认头像
    await setDoc(doc(db, "users", cred.user.uid), {
      email: cred.user.email,
      displayName: email.split("@")[0],
      avatar: { type: "color", value: "#3b82f6" },
      createdAt: Date.now(),
    }, { merge: true });
    
    await signOut(auth);
    alert("Verification email sent. Please verify your email before logging in.");
    router.replace("/auth/login");
  };

  /** 登录：必须验证邮箱 */
  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cred.user.reload();
    if (!cred.user.emailVerified) {
      await signOut(auth);
      throw new Error("Email not verified yet. Please click the link in your inbox.");
    }
    setUser(cred.user);
    loadUserAvatar(cred.user.uid);
    router.replace("/");
  };

  /** 注销 */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserAvatar(null);
    router.replace("/auth/login");
  };

  /** 刷新当前用户状态 */
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  /** 更新用户名 */
  const updateUsername = async (name: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: name,
      });
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    } catch (e) {
      console.error("Failed to update username:", e);
    }
  };

  /** 更新头像 */
  const updateAvatar = async (avatar: UserAvatar) => {
    if (!auth.currentUser) return;
    try {
      let finalAvatar = avatar;
      
      // 如果是自定义图片，先上传到 Firebase Storage
      if (avatar.type === "custom" && avatar.value.startsWith("file://")) {
        const imageUrl = await uploadImageAndGetUrl(avatar.value, `avatars/${auth.currentUser.uid}`);
        finalAvatar = { type: "custom", value: imageUrl };
        await updateProfile(auth.currentUser, { photoURL: imageUrl });
      }
      
      // 保存到 Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        avatar: finalAvatar,
      });
      
      setUserAvatar(finalAvatar);
    } catch (e) {
      console.error("Failed to update avatar:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userAvatar,
      signup, 
      login, 
      logout, 
      refreshUser,
      updateUsername,
      updateAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
