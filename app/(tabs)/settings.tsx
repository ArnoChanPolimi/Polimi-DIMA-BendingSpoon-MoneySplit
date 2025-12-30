// app/(tabs)/settings.tsx

import SettingRow from "@/components/settings/SettingRow";
import SettingSection from "@/components/settings/SettingSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuth } from "@/services/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

type ThemeMode = "system" | "light" | "dark";
type Language = "en" | "zh";
type Currency = "EUR" | "USD" | "CNY";

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const [theme, setTheme] = useState<ThemeMode>("system");
  const [language, setLanguage] = useState<Language>("en");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // 账号菜单（右上角三个点）展开/收起
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const themeLabel =
    theme === "system" ? "System" : theme === "light" ? "Light" : "Dark";

  const languageLabel = language === "en" ? "English" : "Chinese";

  const currencyLabel =
    currency === "EUR" ? "EUR €" : currency === "USD" ? "USD $" : "CNY ¥";

  // 从 user 里安全地拿出展示用信息
  const userEmail = user?.email ?? "";
  const userName = userEmail ? userEmail.split("@")[0] : "User";
  const avatarInitial = (userEmail || "U")[0].toUpperCase();

  return (
    <AppScreen>
      <AppTopBar title="Settings" />

      {/* ===== Account Section ===== */}
      <SettingSection title="Account">
        {user ? (
          <ThemedView style={styles.userCard}>
            {/* 上面一行：标题 + 三个点菜单按钮 */}
            <View style={styles.accountHeaderRow}>
              <ThemedText type="defaultSemiBold">Signed in</ThemedText>

              <Pressable
                hitSlop={8}
                onPress={() => setShowAccountMenu((prev) => !prev)}
              >
                <Ionicons name="ellipsis-vertical" size={18} />
              </Pressable>
            </View>

            {/* 用户信息行：头像 + 名字 + 邮箱 */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <ThemedText type="defaultSemiBold">
                  {avatarInitial}
                </ThemedText>
              </View>

              <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold">{userName}</ThemedText>
                {!!userEmail && (
                  <ThemedText style={styles.userEmail}>
                    {userEmail}
                  </ThemedText>
                )}
              </View>
            </View>

            {/* 右上角菜单：Switch account / Log out */}
            {showAccountMenu && (
              <ThemedView style={styles.accountMenu}>
                <Pressable
                  style={styles.accountMenuItem}
                  onPress={() => {
                    setShowAccountMenu(false);
                    // 切换用户：跳转到登录页，让他重新登陆
                    router.push("/auth/login");
                  }}
                >
                  <Ionicons
                    name="people-outline"
                    size={16}
                    style={styles.accountMenuIcon}
                  />
                  <ThemedText>Switch account</ThemedText>
                </Pressable>

                <Pressable
                  style={styles.accountMenuItem}
                  onPress={async () => {
                    setShowAccountMenu(false);
                    await logout(); // 调用你的全局注销逻辑
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={16}
                    style={styles.accountMenuIcon}
                  />
                  <ThemedText style={{ color: "#b91c1c" }}>
                    Log out
                  </ThemedText>
                </Pressable>
              </ThemedView>
            )}
          </ThemedView>
        ) : (
          <ThemedView style={styles.loginBox}>
            <ThemedText style={styles.loginText}>
              You are not signed in.
            </ThemedText>

            {/* 登录按钮：去 login 界面 */}
            <Link href="/auth/login" asChild>
              <PrimaryButton label="Log in" onPress={() => {}} />
            </Link>

            {/* 注册按钮：去 signup 界面 */}
            <View style={{ height: 8 }} />

            <Link href="/auth/signup" asChild>
              <PrimaryButton
                label="Sign up"
                onPress={() => router.push("/auth/signup")}
              />
            </Link>

            <ThemedText style={styles.loginHint}>
              You can sign up with email (including Google), then log in with the
              same account. Email verification may open your browser or email app.
            </ThemedText>
          </ThemedView>
        )}
      </SettingSection>

      {/* ===== Preferences Section ===== */}
      <SettingSection title="Preferences">
        {/* Theme */}
        <SettingRow
          title="Theme"
          subtitle="System / Light / Dark"
          onPress={() => {
            setShowThemeDropdown(!showThemeDropdown);
            setShowLanguageDropdown(false);
            setShowCurrencyDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{themeLabel}</ThemedText>
              <Ionicons
                name={
                  showThemeDropdown
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={16}
              />
            </ThemedView>
          }
        />

        {showThemeDropdown && (
          <ThemedView style={styles.dropdown}>
            <DropdownOption
              label="System"
              selected={theme === "system"}
              onPress={() => {
                setTheme("system");
                setShowThemeDropdown(false);
              }}
            />
            <DropdownOption
              label="Light"
              selected={theme === "light"}
              onPress={() => {
                setTheme("light");
                setShowThemeDropdown(false);
              }}
            />
            <DropdownOption
              label="Dark"
              selected={theme === "dark"}
              onPress={() => {
                setTheme("dark");
                setShowThemeDropdown(false);
              }}
            />
          </ThemedView>
        )}

        {/* Language */}
        <SettingRow
          title="Language"
          subtitle="App language"
          onPress={() => {
            setShowLanguageDropdown(!showLanguageDropdown);
            setShowThemeDropdown(false);
            setShowCurrencyDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{languageLabel}</ThemedText>
              <Ionicons
                name={
                  showLanguageDropdown
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={16}
              />
            </ThemedView>
          }
        />

        {showLanguageDropdown && (
          <ThemedView style={styles.dropdown}>
            <DropdownOption
              label="English"
              selected={language === "en"}
              onPress={() => {
                setLanguage("en");
                setShowLanguageDropdown(false);
              }}
            />
            <DropdownOption
              label="Chinese"
              selected={language === "zh"}
              onPress={() => {
                setLanguage("zh");
                setShowLanguageDropdown(false);
              }}
            />
          </ThemedView>
        )}

        {/* Currency */}
        <SettingRow
          title="Currency"
          subtitle="Default currency"
          onPress={() => {
            setShowCurrencyDropdown(!showCurrencyDropdown);
            setShowThemeDropdown(false);
            setShowLanguageDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{currencyLabel}</ThemedText>
              <Ionicons
                name={
                  showCurrencyDropdown
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={16}
              />
            </ThemedView>
          }
        />

        {showCurrencyDropdown && (
          <ThemedView style={styles.dropdown}>
            <DropdownOption
              label="EUR €"
              selected={currency === "EUR"}
              onPress={() => {
                setCurrency("EUR");
                setShowCurrencyDropdown(false);
              }}
            />
            <DropdownOption
              label="USD $"
              selected={currency === "USD"}
              onPress={() => {
                setCurrency("USD");
                setShowCurrencyDropdown(false);
              }}
            />
            <DropdownOption
              label="CNY ¥"
              selected={currency === "CNY"}
              onPress={() => {
                setCurrency("CNY");
                setShowCurrencyDropdown(false);
              }}
            />
          </ThemedView>
        )}
      </SettingSection>

      {/* ===== Notifications ===== */}
      <SettingSection title="Notifications">
        <SettingRow
          title="Expense changes"
          subtitle="Notify me when an expense is added or edited"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          }
        />
      </SettingSection>

      {/* ===== About ===== */}
      <SettingSection title="About this app">
        <ThemedText>
          Shared Expenses App — course project based on a Bending Spoons idea.
        </ThemedText>
        <ThemedText>
          These settings are demo-only; you may persist them to a backend later.
        </ThemedText>
      </SettingSection>
    </AppScreen>
  );
}

/* ---------------- Dropdown Option Component ---------------- */
interface DropdownOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function DropdownOption({ label, selected, onPress }: DropdownOptionProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.dropdownOption}>
        <ThemedText>{label}</ThemedText>
        {selected && <Ionicons name="checkmark-outline" size={16} />}
      </ThemedView>
    </Pressable>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  userCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
    position: "relative",
  },
  accountHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#bfdbfe",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userEmail: {
    fontSize: 12,
    opacity: 0.7,
  },
  accountMenu: {
    position: "absolute",
    top: 32,
    right: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 4,
  },
  accountMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  accountMenuIcon: {
    opacity: 0.8,
  },
  loginBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  loginText: {
    marginBottom: 4,
  },
  loginHint: {
    fontSize: 12,
    opacity: 0.7,
  },
  rightWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dropdown: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
