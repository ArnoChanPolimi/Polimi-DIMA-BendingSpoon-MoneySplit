// app/(tabs)/settings.tsx

import SettingRow from "@/components/settings/SettingRow";
import SettingSection from "@/components/settings/SettingSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { t } from "@/core/i18n";
import { useSettings } from "@/core/settings/SettingsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/services/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

type Currency = "EUR" | "USD" | "CNY";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, language, setTheme, setLanguage } = useSettings();

  // ✅ 主题色（统一解决 #ddd/#eee/#fff 写死问题）
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const [currency, setCurrency] = useState<Currency>("EUR");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const themeLabel = useMemo(() => {
    return theme === "system" ? t("system") : theme === "light" ? t("light") : t("dark");
  }, [theme]);

  const languageLabel = useMemo(() => {
    return language === "en" ? t("english") : language === "zh" ? t("chinese") : t("italian");
  }, [language]);

  const currencyLabel =
    currency === "EUR" ? "EUR €" : currency === "USD" ? "USD $" : "CNY ¥";

  const userEmail = user?.email ?? "";
  const userName = userEmail ? userEmail.split("@")[0] : "User";
  const avatarInitial = (userEmail || "U")[0].toUpperCase();

  return (
    <AppScreen>
      <AppTopBar title={t("settings")} />

      {/* ===== Account Section ===== */}
      <SettingSection title={t("account")}>
        {user ? (
          <ThemedView style={[styles.userCard, { borderColor, backgroundColor: cardColor }]}>
            <View style={styles.accountHeaderRow}>
              <ThemedText type="defaultSemiBold">{t("signedIn")}</ThemedText>

              <Pressable hitSlop={8} onPress={() => setShowAccountMenu((p) => !p)}>
                <Ionicons name="ellipsis-vertical" size={18} color={textColor} />
              </Pressable>
            </View>

            <View style={styles.userRow}>
              <ThemedView style={[styles.avatar, { backgroundColor: backgroundColor, borderColor }]}>
                <ThemedText type="defaultSemiBold">{avatarInitial}</ThemedText>
              </ThemedView>

              <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold">{userName}</ThemedText>
                {!!userEmail && <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>}
              </View>
            </View>

            {/* 右上角菜单：Switch account / Log out */}
            {showAccountMenu && (
              <ThemedView
                style={[
                  styles.accountMenu,
                  { borderColor, backgroundColor: cardColor },
                ]}
              >
                <Pressable
                  style={styles.accountMenuItem}
                  onPress={() => {
                    setShowAccountMenu(false);
                    router.push("/auth/login");
                  }}
                >
                  <Ionicons name="people-outline" size={16} color={textColor} style={styles.accountMenuIcon} />
                  <ThemedText>{t("switchAccount")}</ThemedText>
                </Pressable>

                <Pressable
                  style={styles.accountMenuItem}
                  onPress={async () => {
                    setShowAccountMenu(false);
                    await logout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={16} color={textColor} style={styles.accountMenuIcon} />
                  <ThemedText style={styles.dangerText}>{t("logout")}</ThemedText>
                </Pressable>
              </ThemedView>
            )}
          </ThemedView>
        ) : (
          <ThemedView style={[styles.loginBox, { borderColor, backgroundColor: cardColor }]}>
            <ThemedText style={styles.loginText}>{t("notSignedIn")}</ThemedText>

            <Link href="/auth/login" asChild>
              <PrimaryButton label={t("login")} onPress={() => {}} />
            </Link>

            <View style={{ height: 8 }} />

            <Link href="/auth/signup" asChild>
              <PrimaryButton label={t("signup")} onPress={() => router.push("/auth/signup")} />
            </Link>
          </ThemedView>
        )}
      </SettingSection>

      {/* ===== Preferences Section ===== */}
      <SettingSection title={t("preferences")}>
        {/* Theme */}
        <SettingRow
          title={t("theme")}
          subtitle={t("themeSubtitle")}
          onPress={() => {
            setShowThemeDropdown(!showThemeDropdown);
            setShowLanguageDropdown(false);
            setShowCurrencyDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{themeLabel}</ThemedText>
              <Ionicons
                name={showThemeDropdown ? "chevron-up-outline" : "chevron-down-outline"}
                size={16}
                color={textColor}
              />
            </ThemedView>
          }
        />

        {showThemeDropdown && (
          <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
            <DropdownOption
              label={t("system")}
              selected={theme === "system"}
              onPress={async () => {
                await setTheme("system");
                setShowThemeDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
            <DropdownOption
              label={t("light")}
              selected={theme === "light"}
              onPress={async () => {
                await setTheme("light");
                setShowThemeDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
            <DropdownOption
              label={t("dark")}
              selected={theme === "dark"}
              onPress={async () => {
                await setTheme("dark");
                setShowThemeDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
          </ThemedView>
        )}

        {/* Language */}
        <SettingRow
          title={t("language")}
          subtitle={t("appLanguage")}
          onPress={() => {
            setShowLanguageDropdown(!showLanguageDropdown);
            setShowThemeDropdown(false);
            setShowCurrencyDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{languageLabel}</ThemedText>
              <Ionicons
                name={showLanguageDropdown ? "chevron-up-outline" : "chevron-down-outline"}
                size={16}
                color={textColor}
              />
            </ThemedView>
          }
        />

        {showLanguageDropdown && (
          <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
            <DropdownOption
              label={t("english")}
              selected={language === "en"}
              onPress={async () => {
                await setLanguage("en");
                setShowLanguageDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
            <DropdownOption
              label={t("chinese")}
              selected={language === "zh"}
              onPress={async () => {
                await setLanguage("zh");
                setShowLanguageDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
            <DropdownOption
              label={t("italian")}
              selected={language === "it"}
              onPress={async () => {
                await setLanguage("it");
                setShowLanguageDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
          </ThemedView>
        )}

        {/* Currency */}
        <SettingRow
          title={t("currency")}
          subtitle={t("defaultCurrency")}
          onPress={() => {
            setShowCurrencyDropdown(!showCurrencyDropdown);
            setShowThemeDropdown(false);
            setShowLanguageDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{currencyLabel}</ThemedText>
              <Ionicons
                name={showCurrencyDropdown ? "chevron-up-outline" : "chevron-down-outline"}
                size={16}
                color={textColor}
              />
            </ThemedView>
          }
        />

        {showCurrencyDropdown && (
          <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
            <DropdownOption
              label="EUR €"
              selected={currency === "EUR"}
              onPress={() => {
                setCurrency("EUR");
                setShowCurrencyDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
            <DropdownOption
              label="USD $"
              selected={currency === "USD"}
              onPress={() => {
                setCurrency("USD");
                setShowCurrencyDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
            <DropdownOption
              label="CNY ¥"
              selected={currency === "CNY"}
              onPress={() => {
                setCurrency("CNY");
                setShowCurrencyDropdown(false);
              }}
              borderColor={borderColor}
              textColor={textColor}
            />
          </ThemedView>
        )}
      </SettingSection>

      {/* ===== Notifications ===== */}
      <SettingSection title={t("notifications")}>
        <SettingRow
          title={t("expenseChanges")}
          subtitle={t("notifyExpense")}
          right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
        />
      </SettingSection>

      {/* ===== About ===== */}
      <SettingSection title={t("about")}>
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
  borderColor: string;
  textColor: string;
}

function DropdownOption({ label, selected, onPress, borderColor, textColor }: DropdownOptionProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={[styles.dropdownOption, { borderBottomColor: borderColor }]}>
        <ThemedText>{label}</ThemedText>
        {selected && <Ionicons name="checkmark-outline" size={16} color={textColor} />}
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
    opacity: 0.9,
  },
  dangerText: {
    color: "#b91c1c",
  },

  loginBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  loginText: {
    marginBottom: 4,
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
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
});