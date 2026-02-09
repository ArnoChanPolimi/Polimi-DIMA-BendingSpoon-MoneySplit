// app/auth/login.tsx
import { useAuth } from "@/components/auth/AuthContext";
import { PixelIcon } from "@/components/ui/PixelIcon";
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
  const [showTerms, setShowTerms] = useState(false);

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
    <View style={[styles.screenContainer, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={15}>
        <PixelIcon name="back" size={24} color={isDarkMode ? "#fff" : "#000"} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#333" }]}>Welcome Back</Text>
      
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: isDarkMode ? "#000" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]}
          placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { color: isDarkMode ? "#000" : "#000", borderColor: isDarkMode ? "#555" : "#ddd", flex: 1 }]}
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

        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: isDarkMode ? "#999" : "#666" }]}>Don't have an account? </Text>
          <Pressable onPress={handleSignup}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </View>

        <View style={styles.termsLinkContainer}>
          <Pressable onPress={() => setShowTerms(true)}>
            <Text style={[styles.termsLink, { color: isDarkMode ? "#60a5fa" : "#007AFF" }]}>View Terms and Conditions</Text>
          </Pressable>
        </View>

        {showForgotPassword && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" }]}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Reset Password</Text>
              
              <TextInput
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                style={[styles.input, { color: isDarkMode ? "#000" : "#000", borderColor: isDarkMode ? "#555" : "#ddd" }]}
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
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: "center", paddingTop: 60 },
  backButton: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    minWidth: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 16, fontFamily: "PressStart2P_400Regular", marginBottom: 32, textAlign: "center" },
  form: { width: "100%", marginTop: 40 },
  input: {
    borderWidth: 3,
    borderColor: "#60a5fa",
    padding: 14,
    marginBottom: 16,
    borderRadius: 0,
    backgroundColor: "rgba(219, 234, 254, 0.7)",
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
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#1d4ed8",
    alignItems: "center",
    marginBottom: 12,
  },
  blueButtonText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "PressStart2P_400Regular",
  },
  grayButton: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  grayButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  forgotPasswordButton: {
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  signupText: {
    fontSize: 12,
    fontWeight: "600",
  },
  signupLink: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  termsLinkContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  termsLink: {
    fontSize: 11,
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
    fontSize: 12,
    fontFamily: "PressStart2P_400Regular",
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
