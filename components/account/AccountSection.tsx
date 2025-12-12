// components/account/AccountSection.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

type UserPreview = {
  name: string;
  email?: string;
  avatarUrl?: string;
};

interface AccountSectionProps {
  // 以后可以从全局 auth 里传真正的 user 进来
  user?: UserPreview | null;
}

export default function AccountSection({ user }: AccountSectionProps) {
  // 为了演示 3 个点的菜单，用一个本地 state 控制它的展开 / 收起（UI 而已）
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user;

  if (!isLoggedIn) {
    // —— 未登录状态：展示“登录 / 注册”入口 ——
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="title">Account</ThemedText>
        <ThemedText style={styles.subText}>
          You are not logged in. Log in or create an account to sync your groups across devices.
        </ThemedText>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.primaryButton, styles.button]}
            onPress={() => router.push("/auth/login")}
          >
            <ThemedText style={styles.primaryButtonText}>Log in</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, styles.button]}
            onPress={() => router.push("/auth/signup")}
          >
            <ThemedText style={styles.secondaryButtonText}>Sign up</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  // —— 已登录状态：展示头像 + 名字 + 右上角三个点菜单 ——
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <ThemedView style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Account</ThemedText>

        <Pressable onPress={() => setMenuOpen((prev) => !prev)} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} />
        </Pressable>
      </View>

      <View style={styles.userRow}>
        {/* 头像：有 url 用网络头像，没有就用颜色圆圈 + 首字母 */}
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <ThemedText style={styles.avatarInitial}>{initials}</ThemedText>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
            {user?.name}
          </ThemedText>
          {user?.email && (
            <ThemedText style={styles.emailText}>{user.email}</ThemedText>
          )}
        </View>
      </View>

      {menuOpen && (
        <ThemedView style={styles.menu}>
          {/* 这里只是 UI，具体切换用户 / 退出登录逻辑后面再接 */}
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              // TODO: 实现“切换用户”：跳到登录页，并清空当前登录状态
              // router.push("/auth/login");
            }}
          >
            <Ionicons name="people-outline" size={16} style={styles.menuIcon} />
            <ThemedText>Switch account</ThemedText>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              // TODO: 实现“退出登录”：清除本地用户+token
              // 调用真正的 logout()
            }}
          >
            <Ionicons name="log-out-outline" size={16} style={styles.menuIcon} />
            <ThemedText style={{ color: "#b91c1c" }}>Log out</ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    gap: 8,
  },
  subText: {
    fontSize: 13,
    opacity: 0.8,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "white",
    fontSize: 18,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  emailText: {
    fontSize: 13,
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 14,
  },
  menu: {
    position: "absolute",
    right: 10,
    top: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingVertical: 4,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  menuIcon: {
    opacity: 0.8,
  },
});
