// app/auth/login.tsx
import { useAuth } from "@/components/auth/AuthContext";
import { useSettings } from "@/core/settings/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auth, db } from "../../services/firebase";

export default function LoginScreen() {
  const { login, logout, checkEmailVerified } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const isDarkMode = resolvedTheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill all fields");
    }

    setLoading(true);
    try {
      await login(email, password);

      const isVerified = await checkEmailVerified();

      if (!isVerified) {
        await logout();
        return Alert.alert("Email Not Verified", "Please click the link in your email first.");
      }

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const rawUsername = user.displayName || user.email?.split("@")[0] || "User";
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        await setDoc(userRef, {
          uid: user.uid,
          email: user.email?.toLowerCase() ?? "",
          username: userData?.username || rawUsername,
          avatar: userData?.avatar || user.photoURL || "",
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      return Alert.alert("Error", "Please enter your email address");
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert("Success", "Password reset email sent. Please check your inbox.", [
        { text: "OK", onPress: () => setShowForgotPassword(false) }
      ]);
      setResetEmail("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </Pressable>
      </View>
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#333" }]}>Welcome Back</Text>
      
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]}
          placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd", flex: 1 }]}
            placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
            secureTextEntry={!passwordVisible}
          />
          <Ionicons
            name={passwordVisible ? "eye-off" : "eye"}
            size={24}
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={[styles.eyeIcon, { color: isDarkMode ? "#fff" : "#000" }]}
          />
        </View>

        <View style={styles.buttonSpacer} />
        <Pressable onPress={handleLogin} disabled={loading} style={[styles.blueButton, { opacity: loading ? 0.6 : 1 }]}>
          <Text style={styles.blueButtonText}>{loading ? "Logging in..." : "Login"}</Text>
        </Pressable>

        <Pressable onPress={() => setShowForgotPassword(true)} style={styles.forgotPasswordButton}>
          <Text style={[styles.forgotPasswordText, { color: isDarkMode ? "#60a5fa" : "#007AFF" }]}>Forgot Password?</Text>
        </Pressable>

        <Pressable onPress={handleSignup} style={styles.grayButton}>
          <Text style={styles.grayButtonText}>Don't have an account? Sign up</Text>
        </Pressable>

        {showForgotPassword && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" }]}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Reset Password</Text>
              
              <TextInput
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                style={[styles.input, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]}
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Pressable onPress={handleForgotPassword} disabled={resetLoading} style={[styles.blueButton, { opacity: resetLoading ? 0.6 : 1 }]}>
                <Text style={styles.blueButtonText}>{resetLoading ? "Sending..." : "Send Reset Email"}</Text>
              </Pressable>

              <Pressable onPress={() => setShowForgotPassword(false)} style={styles.grayButton}>
                <Text style={styles.grayButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
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
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eyeIcon: {
    marginLeft: -30,
  },
  buttonSpacer: { height: 30 },
  buttonWrapper: { width: "100%", marginBottom: 12, borderRadius: 8, overflow: "hidden" },
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
  forgotPasswordButton: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
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
});
