// app/auth/signup.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");

  const handleGoogleSignUp = () => {
    // TODO: 走 Google 授权注册逻辑
    alert("TODO: implement Google sign up");
  };

  const handleSendVerification = () => {
    // TODO: 后端发送验证邮件，并提示用户去浏览器/邮箱完成绑定
    alert("TODO: send verification email & open browser");
  };

  const handleEmailSignup = () => {
    if (!email || !password || !passwordAgain) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== passwordAgain) {
      alert("Passwords do not match.");
      return;
    }

    // TODO: 调用真正的注册接口，然后保存用户信息
    alert("TODO: implement email sign up");
  };

  return (
    <AppScreen>
      <AppTopBar 
        title="Sign up"
        showBack
        onBackPress={() => router.replace("/auth/login")}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={styles.title}>
            Create your account
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign up with your email or Google. We&apos;ll bind your email and
            send a verification link that opens in your browser (Chrome, Edge, etc.).
          </ThemedText>

          {/* —— 1. Google 注册 —— */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick sign up
          </ThemedText>

          <Pressable
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
          >
            <Ionicons name="logo-google" size={18} style={{ marginRight: 8 }} />
            <ThemedText style={styles.googleButtonText}>
              Continue with Google
            </ThemedText>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>or sign up with email</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          {/* —— 2. 邮箱注册 —— */}
          <ThemedView style={styles.formCard}>
            <ThemedText>Email</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
            />

            <View style={{ height: 10 }} />

            <ThemedText>Password</ThemedText>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
            />

            <View style={{ height: 10 }} />

            <ThemedText>Repeat password</ThemedText>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Repeat your password"
              value={passwordAgain}
              onChangeText={setPasswordAgain}
            />

            <View style={{ height: 10 }} />

            <ThemedText style={styles.helperText}>
              After signing up, we&apos;ll send a verification email. You may be
              redirected to your browser or email app to complete the binding.
            </ThemedText>

            <Pressable
              style={[styles.secondaryButton, { marginTop: 8 }]}
              onPress={handleSendVerification}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Send verification email
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, { marginTop: 10 }]}
              onPress={handleEmailSignup}
            >
              <ThemedText style={styles.primaryButtonText}>Sign up</ThemedText>
            </Pressable>
          </ThemedView>

          {/* —— 3. 已有账号去登录 —— */}
          <View style={styles.bottomRow}>
            <ThemedText style={{ fontSize: 13 }}>
              Already have an account?
            </ThemedText>
            <Pressable onPress={() => router.push("/auth/login")}>
              <ThemedText style={styles.linkText}>Log in</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  googleButtonText: {
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 11,
    opacity: 0.7,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    gap: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    fontSize: 14,
  },
  helperText: {
    fontSize: 11,
    opacity: 0.8,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingVertical: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 13,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    color: "#2563eb",
  },
});
