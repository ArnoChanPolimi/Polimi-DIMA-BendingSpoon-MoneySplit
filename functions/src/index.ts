// functions/src/index.ts

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

// 注册新邮箱用户（不登录）
export const registerEmailOnly = functions.https.onCall(async (data) => {
  const { email } = data;
  if (!email) throw new functions.https.HttpsError("invalid-argument", "Email required");

  // 创建用户但不设置密码
  const user = await admin.auth().createUser({
    email,
    emailVerified: false,
  });

  // 生成邮箱验证链接
  const link = await admin.auth().generateEmailVerificationLink(email);

  // 返回 link 给前端，由前端提示用户去邮箱点击
  return { uid: user.uid, verificationLink: link };
});

// 设置密码（用户点击邮箱验证后）
export const setPassword = functions.https.onCall(async (data) => {
  const { uid, password } = data;
  if (!uid || !password) throw new functions.https.HttpsError("invalid-argument", "uid and password required");

  await admin.auth().updateUser(uid, { password });
  return { success: true };
});
