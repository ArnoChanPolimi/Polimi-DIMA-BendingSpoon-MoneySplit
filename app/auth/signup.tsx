// app/auth/signup.tsx
import { useAuth } from "@/components/auth/AuthContext";
import { useSettings } from "@/core/settings/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../services/firebase";

export default function SignupScreen() {
  const { signup, checkEmailVerified } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const isDarkMode = resolvedTheme === "dark";
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("Simple");
  const [passwordStrengthColor, setPasswordStrengthColor] = useState("#ddd");

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

  const evaluatePasswordStrength = (password: string) => {
    if (password.length < 6) {
      setPasswordStrength("Simple");
      setPasswordStrengthColor("#ef4444"); // Red
      return 0.3;
    }
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) {
      setPasswordStrength("Difficult");
      setPasswordStrengthColor("#22c55e"); // Green
      return 1;
    }
    setPasswordStrength("Moderate");
    setPasswordStrengthColor("#f59e0b"); // Orange
    return 0.6;
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
    evaluatePasswordStrength(password);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </Pressable>
      </View>
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#333" }]}>Create Account</Text>
      {step === 1 && (
        <View style={styles.form}>
          {/* 输入框部分保持不变... */}
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]} placeholderTextColor={isDarkMode ? "#aaa" : "#888"} autoCapitalize="none" />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]} placeholderTextColor={isDarkMode ? "#aaa" : "#888"} autoCapitalize="none" keyboardType="email-address" />
          <View style={[styles.passwordInputContainer, { width: "100%" }]}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd", flex: 1 }]}
              secureTextEntry={!passwordVisible}
              placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
            />
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={[styles.eyeIcon, { color: isDarkMode ? "#fff" : "#000" }]}
            />
          </View>
          <View style={styles.passwordStrengthContainer}>
            <View style={[styles.progressBar, { backgroundColor: passwordStrengthColor }]} />
            <Text style={[styles.passwordStrengthText, { color: passwordStrengthColor }]}>{passwordStrength}</Text>
          </View>
          <TextInput placeholder="Confirm Password" value={password2} onChangeText={setPassword2} style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]} placeholderTextColor={isDarkMode ? "#aaa" : "#888"} secureTextEntry />
          
          <View style={styles.buttonSpacer} />
          <Pressable onPress={handleSignup} disabled={loading} style={[styles.blueButton, { opacity: loading ? 0.6 : 1 }]}>
            <Text style={styles.blueButtonText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
          </Pressable>
        </View>
      )}

      {step === 2 && (
        <View style={styles.verifyContainer}>
          <View style={[styles.infoBox, { backgroundColor: isDarkMode ? "#1a1a1a" : "#E6F4FE" }]}>
            <Text style={[styles.verifyText, { color: isDarkMode ? "#ccc" : "#555" }]}>Verification email sent to:</Text>
            <Text style={[styles.emailText, { color: isDarkMode ? "#60a5fa" : "#007AFF" }]}>{email}</Text>
            <Text style={[styles.subText, { color: isDarkMode ? "#aaa" : "#666" }]}>
              Please check your inbox and click the link to activate your account.
            </Text>

            {/* ✅ 正确的位置：倒计时 UI 放在这里，而不是 styles 里 */}
            <View style={styles.timerBox}>
              {timeLeft > 0 ? (
                <Text style={[styles.timerActiveText, { color: isDarkMode ? "#60a5fa" : "#007AFF" }]}>
                  Checking status... {timeLeft}s
                </Text>
              ) : (
                <Text style={[styles.timerEndText, { color: isDarkMode ? "#f87171" : "#ef4444" }]}>
                  Timeout. Please resend if needed.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Pressable onPress={handleVerified} style={[styles.greenButton, { opacity: loading ? 0.6 : 1 }]}>
              <Text style={styles.greenButtonText}>I HAVE VERIFIED</Text>
            </Pressable>
            <Pressable onPress={handleResendEmail} disabled={timeLeft > 0} style={[styles.orangeButton, { opacity: timeLeft > 0 ? 0.6 : 1 }]}>
              <Text style={styles.orangeButtonText}>{timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend Email"}</Text>
            </Pressable>
            <Pressable onPress={() => setStep(1)} style={styles.grayButton}>
              <Text style={styles.grayButtonText}>Back to Edit</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  headerContainer: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  form: { width: "100%", marginTop: 40 },
  input: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  buttonSpacer: { height: 30 },
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
  buttonWrapper: { width: "100%", marginBottom: 12, borderRadius: 8, overflow: "hidden" },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eyeIcon: {
    marginLeft: -30,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    width: 60,
  },
  passwordStrengthText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  blueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  blueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  greenButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  greenButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orangeButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  orangeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  grayButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  grayButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
});