// app/auth/signup.tsx
import { useAuth } from "@/services/AuthContext";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignupScreen() {
  const { signup, checkEmailVerified } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1=输入信息注册, 2=邮箱验证

  // 步骤1：注册
  const handleSignup = async () => {
    if (!email || !password || !password2) return alert("Please fill all fields");
    if (password !== password2) return alert("Passwords do not match");
    try {
      await signup(email, password);
      setStep(2); // 提示用户去邮箱验证
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 步骤2：点击“我已验证”
  const handleVerified = async () => {
    try {
      const verified = await checkEmailVerified();
      if (!verified) return alert("Email not verified yet. Please click the link in your inbox.");
      alert("Email verified! You can now log in.");
      router.push("/auth/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {step === 1 && (
        <>
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
          <TextInput
            placeholder="Confirm Password"
            value={password2}
            onChangeText={setPassword2}
            style={styles.input}
            secureTextEntry
          />
          <Button title="Sign Up" onPress={handleSignup} />
        </>
      )}

      {step === 2 && (
        <>
          <Text>✅ Please verify your email by clicking the link sent to {email}</Text>
          <Button title="I HAVE VERIFIED" onPress={handleVerified} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 6 },
});
