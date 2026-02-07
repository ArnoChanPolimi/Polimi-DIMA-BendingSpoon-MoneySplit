// app/auth/login.tsx
// import { useAuth } from "@/services/AuthContext";
// 在 login.tsx 和 signup.tsx 中统一使用：
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  // const { login } = useAuth();
  // 修改为：
  const { login, logout, checkEmailVerified } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

// 找到 LoginScreen 组件里的 handleLogin 函数：
const handleLogin = async () => {
  try {
      // 1. 执行登录
      await login(email, password);

      // 2. 🔥 【关键检查】：检查是否已验证邮箱
      const isVerified = await checkEmailVerified();

      if (!isVerified) {
        // 如果没验证，强制登出并弹窗提醒
        await logout(); 
        return Alert.alert(
          "Email Not Verified", 
          "Please click the link in your email first."
        );
      }

      // 3. 只有验证通过了，才允许进入主程序
      router.replace("/(tabs)");
    } catch (err: any) {
      // 这里建议用 Alert 替换 alert，体验更统一
      Alert.alert("Login Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 6 },
});
