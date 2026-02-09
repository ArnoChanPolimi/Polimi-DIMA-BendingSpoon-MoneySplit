// app/auth/signup.tsx
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { sendEmailVerification } from "firebase/auth"; // 👈 添加这一行！
import { auth } from "../../services/firebase";

export default function SignupScreen() {
  const { signup, checkEmailVerified } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  // 1. 新增倒计时状态 (放在其他 useState 后面)
  const [timeLeft, setTimeLeft] = useState(60);

  // 2. 新增监控逻辑 (放在 handleSignup 之前)
  // --- 修改后的 useEffect 逻辑 ---
  useEffect(() => {
    // 直接改为 any 或者不指定具体类型，让 TS 自动推断
    let timer: any;
    let checkInterval: any;

    if (step === 2) {
      // A. 视觉倒计时
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // B. 核心感应：每 3 秒检查一次云端验证状态
      checkInterval = setInterval(async () => {
        const isVerified = await checkEmailVerified(); 
        
        if (isVerified) {
          clearInterval(timer);
          clearInterval(checkInterval);
          
          Alert.alert("Success", "Email verified! Welcome aboard.", [
            { text: "Get Started", onPress: () => router.replace("/(tabs)") }
          ]);
        }
      }, 3000);
    }

    // 清理逻辑保持不变
    return () => {
      if (timer) clearInterval(timer);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [step]);

  // 第一步：处理注册提交
  const handleSignup = async () => {
    if (!username || !email || !password || !password2) {
      return Alert.alert("Error", "Please fill all fields");
    }
    if (password !== password2) {
      return Alert.alert("Error", "Passwords do not match");
    }

    setLoading(true);
    try {
      // 执行注册：包含创建账号、存入Firestore、发送邮件、强制登出
      await signup(email, password, username);
      setStep(2); // 进入验证引导页
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message);
    } finally {
      setLoading(false);
    }
  };
  // --- 新增这个处理函数 ---
  const handleResendEmail = async () => {
    try {
      const currentUser = auth.currentUser; 
      if (currentUser) {
        // 这里的报错现在应该消失了，因为它已经从顶部导入了
        await sendEmailVerification(currentUser);
        
        setTimeLeft(60); 
        Alert.alert("Sent", "A new verification email has been sent.");
      } else {
        Alert.alert("Error", "Session expired, please signup again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // 第二步：用户点击“已验证”按钮
  const handleVerified = async () => {
    setLoading(true); // 给个反馈，防止重复点击
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Pending", "We haven't detected the verification yet. Please click the link in your email first.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {step === 1 && (
        <View style={styles.form}>
          {/* 输入框部分保持不变... */}
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
          <TextInput placeholder="Confirm Password" value={password2} onChangeText={setPassword2} style={styles.input} secureTextEntry />
          
          <View style={styles.buttonSpacer} />
          <View style={styles.buttonWrapper}>
            <Button title={loading ? "Creating Account..." : "Sign Up"} onPress={handleSignup} disabled={loading} color="#007AFF" />
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.verifyContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.verifyText}>Verification email sent to:</Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.subText}>
              Please check your inbox and click the link to activate your account.
            </Text>

            {/* ✅ 正确的位置：倒计时 UI 放在这里，而不是 styles 里 */}
            <View style={styles.timerBox}>
              {timeLeft > 0 ? (
                <Text style={styles.timerActiveText}>
                  Checking status... {timeLeft}s
                </Text>
              ) : (
                <Text style={styles.timerEndText}>
                  Timeout. Please resend if needed.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <View style={styles.buttonWrapper}>
              <Button title="I HAVE VERIFIED" onPress={handleVerified} color="#28a745" />
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                title={timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend Email"} 
                onPress={handleResendEmail} 
                disabled={timeLeft > 0} // 倒计时没走完，不让点
                color="#FF9800" 
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Back to Edit" onPress={() => setStep(1)} color="#666" />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 32, textAlign: "center", color: "#333" },
  form: { width: "100%" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 14, marginBottom: 16, borderRadius: 10, backgroundColor: "#f9f9f9" },
  buttonSpacer: { height: 10 },
  verifyContainer: { alignItems: "center", width: "100%" },
  infoBox: { backgroundColor: "#E6F4FE", padding: 20, borderRadius: 12, width: "100%", marginBottom: 30, alignItems: "center" },
  // ✅ 新增的倒计时样式
  timerBox: { marginTop: 15 },
  timerActiveText: { color: '#007AFF', fontWeight: 'bold', textAlign: 'center' },
  timerEndText: { color: '#ef4444', textAlign: 'center' },
  verifyText: { fontSize: 16, color: "#555", marginBottom: 8 },
  emailText: { fontSize: 18, fontWeight: "bold", color: "#007AFF", marginBottom: 12, textAlign: "center" },
  subText: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },
  buttonGroup: { width: "100%", alignItems: "center" },
  buttonWrapper: { width: "100%", marginBottom: 12, borderRadius: 8, overflow: "hidden" }
});