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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("Simple");
  const [passwordStrengthColor, setPasswordStrengthColor] = useState("#ddd");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
    if (!agreeToTerms) {
      return Alert.alert("Error", "Please agree to the terms and conditions");
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
    // Simple: 只有数字
    if (password.length >= 6 && /^\d+$/.test(password)) {
      setPasswordStrength("Simple");
      setPasswordStrengthColor("#ef4444"); // Red
      return 0.3;
    }
    // Safe: 字母 + 特殊符号 + 数字
    if (password.match(/[A-Za-z]/) && password.match(/[0-9]/) && password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
      setPasswordStrength("Safe");
      setPasswordStrengthColor("#22c55e"); // Green
      return 1;
    }
    // Moderate: 字母 + 数字
    if (password.match(/[A-Za-z]/) && password.match(/[0-9]/)) {
      setPasswordStrength("Moderate");
      setPasswordStrengthColor("#f59e0b"); // Orange
      return 0.6;
    }
    // 如果长度不足或不符合任何条件
    setPasswordStrength("Simple");
    setPasswordStrengthColor("#ef4444"); // Red
    return 0.3;
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
    evaluatePasswordStrength(password);
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={15}>
        <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.container}>
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
          
          <View style={styles.termsContainer}>
            <Pressable onPress={() => setAgreeToTerms(!agreeToTerms)} style={styles.checkboxRow}>
              <View style={[styles.checkbox, { borderColor: isDarkMode ? "#555" : "#ddd", backgroundColor: agreeToTerms ? "#007AFF" : "transparent" }]}>
                {agreeToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <View style={styles.termsTextWrapper}>
                <Text style={[styles.termsText, { color: isDarkMode ? "#ccc" : "#666" }]}>I agree to the </Text>
                <Pressable onPress={() => setShowTerms(true)}>
                  <Text style={styles.termsLink}>Terms and Conditions</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
          
          <View style={styles.buttonSpacer} />
          <Pressable onPress={handleSignup} disabled={loading || !agreeToTerms} style={[styles.blueButton, { opacity: (loading || !agreeToTerms) ? 0.6 : 1 }]}>
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

      {showTerms && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#1a1a1a" : "#fff", maxHeight: "80%" }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Terms and Conditions</Text>
            
            <ScrollView style={styles.termsContent}>
              <Text style={[styles.termsBody, { color: isDarkMode ? "#ccc" : "#333" }]}>
{`1. User Agreement
By using MoneySplit, you agree to these terms and conditions.

2. Account Responsibility
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

3. Acceptable Use
You agree not to use MoneySplit for any unlawful or prohibited purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the service.

4. User Content
You retain ownership of any content you submit, post, or display on MoneySplit. By submitting content, you grant MoneySplit a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any media.

5. Privacy
Your use of MoneySplit is also governed by our Privacy Policy. Please review our Privacy Policy to understand our privacy practices.

6. Limitation of Liability
MoneySplit and its creators are not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.

7. Termination
We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms and Conditions.

8. Changes to Terms
MoneySplit reserves the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service following the posting of revised terms means that you accept and agree to the changes.

9. Governing Law
These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in which MoneySplit operates.

10. Contact
If you have any questions about these Terms and Conditions, please contact us through the app.`}
              </Text>
            </ScrollView>

            <Pressable onPress={() => setShowTerms(false)} style={styles.blueButton}>
              <Text style={styles.blueButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: "center", paddingTop: 60 },
  backButton: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    minWidth: 48,
    justifyContent: "center",
    alignItems: "center",
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
  termsContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
    justifyContent: "flex-start",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    flex: 1,
  },
  termsTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  termsLink: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  termsContent: {
    marginBottom: 16,
    maxHeight: 300,
  },
  termsBody: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
});