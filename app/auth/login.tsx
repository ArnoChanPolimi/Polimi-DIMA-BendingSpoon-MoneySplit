// app/auth/login.tsx
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 这里只是 UI 占位，真正逻辑以后再填
  const handleEmailLogin = () => {
    alert("TODO: implement email login");
  };

  const handleGoogleLogin = () => {
    alert("TODO: implement Google login");
  };

  const handleForgotPassword = () => {
    alert("TODO: open password reset page in browser");
  };

  return (
    <AppScreen>
      {/* 这里加上返回按钮 */}
      <AppTopBar
        title="Log in"
        showBack
        onBackPress={() => router.replace("/(tabs)/settings")}  
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
            Welcome back
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Log in to access your groups and split history across devices.
          </ThemedText>

          {/* —— 1. Google 登录入口 —— */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick login
          </ThemedText>

          <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={18} style={{ marginRight: 8 }} />
            <ThemedText style={styles.googleButtonText}>
              Continue with Google
            </ThemedText>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>
              or log in with email
            </ThemedText>
            <View style={styles.dividerLine} />
          </View>

          {/* —— 2. 邮箱 + 密码登录 —— */}
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
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
            />

            <Pressable style={styles.forgotRow} onPress={handleForgotPassword}>
              <ThemedText style={styles.forgotText}>
                Forgot password?
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, { marginTop: 12 }]}
              onPress={handleEmailLogin}
            >
              <ThemedText style={styles.primaryButtonText}>Log in</ThemedText>
            </Pressable>
          </ThemedView>

          {/* —— 3. 去注册 —— */}
          <View style={styles.bottomRow}>
            <ThemedText style={{ fontSize: 13 }}>
              Don&apos;t have an account?
            </ThemedText>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <ThemedText style={styles.linkText}>Sign up</ThemedText>
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
  forgotRow: {
    alignItems: "flex-end",
    marginTop: 6,
  },
  forgotText: {
    fontSize: 12,
    color: "#2563eb",
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
