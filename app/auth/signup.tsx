// app/auth/signup.tsx
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignupScreen() {
  const { signup, checkEmailVerified } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

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

  // 第二步：用户点击“已验证”按钮
  const handleVerified = async () => {
    // 逻辑说明：由于注册后已强制登出，此时 auth.currentUser 为空
    // 我们告知用户直接去登录页，登录页的 handleLogin 会负责最终的验证检查
    Alert.alert(
      "Confirm",
      "If you have clicked the link in your email, please proceed to the Login screen to access your account.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Go to Login", onPress: () => router.push("/auth/login") }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {step === 1 && (
        <View style={styles.form}>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Confirm Password"
            value={password2}
            onChangeText={setPassword2}
            style={styles.input}
            secureTextEntry
          />
          
          <View style={styles.buttonSpacer} />
          
          <View style={styles.buttonWrapper}>
            <Button 
              title={loading ? "Creating Account..." : "Sign Up"} 
              onPress={handleSignup} 
              disabled={loading}
              color="#007AFF"
            />
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.verifyContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.verifyText}>
              Verification email sent to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.subText}>
              Please check your inbox (and spam folder) and click the link to activate your account.
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <View style={styles.buttonWrapper}>
              <Button 
                title="I HAVE VERIFIED" 
                onPress={handleVerified} 
                color="#28a745"
              />
            </View>

            <View style={styles.buttonWrapper}>
              <Button 
                title="Resend Email" 
                onPress={() => Alert.alert("Tip", "If you didn't receive the email, please go back and check your address or wait a few minutes.")} 
                color="#FF9800" 
              />
            </View>

            <View style={styles.buttonWrapper}>
              <Button 
                title="Back to Edit" 
                onPress={() => setStep(1)} 
                color="#666" 
              />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: "center",
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 32, 
    textAlign: "center",
    color: "#333" 
  },
  form: {
    width: "100%",
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 14, 
    marginBottom: 16, 
    borderRadius: 10,
    backgroundColor: "#f9f9f9"
  },
  buttonSpacer: {
    height: 10
  },
  verifyContainer: { 
    alignItems: "center",
    width: "100%"
  },
  infoBox: {
    backgroundColor: "#E6F4FE",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    marginBottom: 30,
    alignItems: "center"
  },
  verifyText: { 
    fontSize: 16, 
    color: "#555",
    marginBottom: 8
  },
  emailText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#007AFF",
    marginBottom: 12,
    textAlign: "center"
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center"
  },
  buttonWrapper: {
    width: "100%", // 这里确保按钮容器占满
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden" // 确保圆角在Android上生效
  }
});