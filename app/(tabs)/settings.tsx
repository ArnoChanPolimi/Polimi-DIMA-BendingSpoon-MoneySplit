// app\(tabs)\settings.tsx
import { useAuth } from "@/components/auth/AuthContext";
import SettingRow from "@/components/settings/SettingRow";
import SettingSection from "@/components/settings/SettingSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import AvatarPicker from "@/components/ui/AvatarPicker";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { t } from "@/core/i18n";
import { useSettings } from "@/core/settings/SettingsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { UserAvatar } from "@/services/AuthContext";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
// 修复：确保导入了 Modal 和 TextInput
import { Image, ImageSourcePropType, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

type Currency = "EUR" | "USD" | "CNY";

// 默认头像映射表
const DEFAULT_AVATAR_SOURCES: Record<string, ImageSourcePropType> = {
  avatar_1: require("@/assets/images/avatars/avatar_1.png"),
  avatar_2: require("@/assets/images/avatars/avatar_2.png"),
  avatar_3: require("@/assets/images/avatars/avatar_3.png"),
  avatar_4: require("@/assets/images/avatars/avatar_4.png"),
  avatar_5: require("@/assets/images/avatars/avatar_5.png"),
  avatar_6: require("@/assets/images/avatars/avatar_6.png"),
  avatar_7: require("@/assets/images/avatars/avatar_7.png"),
  avatar_8: require("@/assets/images/avatars/avatar_8.png"),
};

export default function SettingsScreen() {
  const { user, userAvatar, logout, updateUsername, updateAvatar } = useAuth();
  const { theme, language, setTheme, setLanguage } = useSettings();

  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const [currency, setCurrency] = useState<Currency>("EUR");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // 状态：控制自定义弹窗
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isAvatarPickerVisible, setIsAvatarPickerVisible] = useState(false);

  const themeLabel = useMemo(() => {
    return theme === "system" ? t("system") : theme === "light" ? t("light") : t("dark");
  }, [theme]);

  const languageLabel = useMemo(() => {
    return language === "en" ? t("english") : t("italian");
  }, [language]);

  const currencyLabel =
    currency === "EUR" ? "EUR €" : currency === "USD" ? "USD $" : "CNY ¥";

  const userEmail = user?.email ?? "";
  const userName = user?.displayName || (userEmail ? userEmail.split("@")[0] : "User");
  const avatarInitial = (userName || "U")[0].toUpperCase();

  // 刷新函数
  const handleRefresh = () => {
    setIsRefreshing(true);
    // 重置所有状态
    setShowThemeDropdown(false);
    setShowLanguageDropdown(false);
    setShowCurrencyDropdown(false);
    setShowAccountMenu(false);
    setIsEditModalVisible(false);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <AppScreen>
      <AppTopBar 
        title={t("settings")}
        showRefresh={true}
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ===== Account Section ===== */}
        <View style={{ zIndex: 10, position: 'relative' }}>
          <SettingSection title={t("account")}>
            {user ? (
              <ThemedView style={[styles.userCard, { borderColor, backgroundColor: cardColor }]}>
                <View style={styles.accountHeaderRow}>
                  <ThemedText type="defaultSemiBold">{t("signedIn")}</ThemedText>
                  
                  {/* 核心修复：添加 zIndex 确保锚点容器高于下方的 userRow，否则菜单会被头像遮挡 */}
                  <Pressable hitSlop={15} onPress={() => setShowAccountMenu((p) => !p)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={textColor} />
                  </Pressable>
                    
                </View>

                <View style={styles.userRow}>
                  <Pressable onPress={() => setIsAvatarPickerVisible(true)}>
                    {userAvatar?.type === "custom" ? (
                      <Image source={{ uri: userAvatar.value }} style={styles.avatarImage} />
                    ) : userAvatar?.type === "default" && DEFAULT_AVATAR_SOURCES[userAvatar.value] ? (
                      <Image source={DEFAULT_AVATAR_SOURCES[userAvatar.value]} style={styles.avatarImage} />
                    ) : userAvatar?.type === "color" ? (
                      <ThemedView style={[styles.avatar, { backgroundColor: userAvatar.value }]}>
                        <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>{avatarInitial}</ThemedText>
                      </ThemedView>
                    ) : (
                      <ThemedView style={[styles.avatar, { backgroundColor: backgroundColor, borderColor }]}>
                        <ThemedText type="defaultSemiBold">{avatarInitial}</ThemedText>
                      </ThemedView>
                    )}
                  </Pressable>

                  <View style={styles.userInfo}>
                    <ThemedText type="defaultSemiBold">{userName}</ThemedText>
                    {!!userEmail && <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>}
                  </View>
                </View>
                {showAccountMenu && (
                  <ThemedView style={[styles.accountMenu, { borderColor, backgroundColor: cardColor }]}>
                    <Pressable
                      style={styles.accountMenuItem}
                      onPress={() => {
                        setIsAvatarPickerVisible(true);
                        setShowAccountMenu(false);
                      }}
                    >
                      <Ionicons name="person-circle-outline" size={18} color={textColor} />
                      <ThemedText>{t("changeAvatar")}</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.accountMenuItem, { borderTopWidth: 1, borderTopColor: borderColor }]}
                      onPress={() => {
                        // 1. 先把名字塞进变量
                        setTempName(user?.displayName || ""); 
                        
                        // 2. 先把弹窗打开
                        setIsEditModalVisible(true); 
                        
                        // 3. 最后再关掉菜单
                        setShowAccountMenu(false);
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color={textColor} />
                      <ThemedText>{t("editName")}</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.accountMenuItem, { borderTopWidth: 1, borderTopColor: borderColor }]}
                      onPress={() => {
                        setShowAccountMenu(false);
                        logout?.();
                      }}
                    >
                      <Ionicons name="log-out-outline" size={18} color="#b91c1c" />
                      <ThemedText style={styles.dangerText}>{t("logout")}</ThemedText>
                    </Pressable>
                  </ThemedView>
                )}
              </ThemedView>
            ) : (
              <ThemedView style={[styles.loginBox, { borderColor, backgroundColor: cardColor }]}>
                <ThemedText style={{ fontSize: 12, color: '#9ca3af' }}>{t("notSignedIn")}</ThemedText>
                <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
                  <Pressable style={{ flex: 1 }} onPress={() => router.push("/auth/login")}>
                    <PrimaryButton label={t("login")} onPress={() => router.push("/auth/login")} />
                  </Pressable>
                  <Pressable style={{ flex: 1 }} onPress={() => router.push("/auth/signup")}>
                    <PrimaryButton label={t("signup")} onPress={() => router.push("/auth/signup")} />
                  </Pressable>
                </View>
              </ThemedView>
            )}
          </SettingSection>
        </View>

        {/* ===== Preferences Section ===== */}
        <SettingSection title={t("preferences")}>
          {/* Theme Selector */}
          <SettingRow
            title={t("theme")}
            onPress={() => setShowThemeDropdown(!showThemeDropdown)}
          />
          {showThemeDropdown && (
            <View style={[styles.dropdown, { borderColor }]}>
              {(["system", "light", "dark"] as const).map((mode) => (
                <Pressable
                  key={mode}
                  style={[styles.dropdownOption, { borderBottomColor: borderColor }]}
                  onPress={() => {
                    setTheme(mode);
                    setShowThemeDropdown(false);
                  }}
                >
                  <ThemedText>
                    {mode === "system" ? t("system") : mode === "light" ? t("light") : t("dark")}
                  </ThemedText>
                  {theme === mode && <Ionicons name="checkmark" size={20} color="#2563eb" />}
                </Pressable>
              ))}
            </View>
          )}

          {/* Language Selector */}
          <SettingRow
            title={t("language")}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
          />
          {showLanguageDropdown && (
            <View style={[styles.dropdown, { borderColor }]}>
              {(["en", "it"] as const).map((lang) => (
                <Pressable
                  key={lang}
                  style={[styles.dropdownOption, { borderBottomColor: borderColor }]}
                  onPress={() => {
                    setLanguage(lang);
                    setShowLanguageDropdown(false);
                  }}
                >
                  <ThemedText>
                    {lang === "en" ? t("english") : t("italian")}
                  </ThemedText>
                  {language === lang && <Ionicons name="checkmark" size={20} color="#2563eb" />}
                </Pressable>
              ))}
            </View>
          )}

          {/* Currency Selector */}
          <SettingRow
            title={t("currency")}
            onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
          />
          {showCurrencyDropdown && (
            <View style={[styles.dropdown, { borderColor }]}>
              {(["EUR", "USD", "CNY"] as const).map((curr) => (
                <Pressable
                  key={curr}
                  style={[styles.dropdownOption, { borderBottomColor: borderColor }]}
                  onPress={() => {
                    setCurrency(curr);
                    setShowCurrencyDropdown(false);
                  }}
                >
                  <ThemedText>
                    {curr === "EUR" ? "EUR €" : curr === "USD" ? "USD $" : "CNY ¥"}
                  </ThemedText>
                  {currency === curr && <Ionicons name="checkmark" size={20} color="#2563eb" />}
                </Pressable>
              ))}
            </View>
          )}

          {/* Notifications */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 }}>
            <View>
              <ThemedText style={{ fontFamily: 'PressStart2P_400Regular', fontSize: 10 }}>{t("notifications")}</ThemedText>
              <ThemedText style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                {t("expenseChanges")}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              style={{
                width: 48,
                height: 24,
                backgroundColor: notificationsEnabled ? '#60a5fa' : '#ccc',
                borderWidth: 3,
                borderColor: notificationsEnabled ? '#2563eb' : '#999',
                justifyContent: 'center',
                padding: 2,
              }}
            >
              <View style={{
                width: 16,
                height: 16,
                backgroundColor: '#fff',
                alignSelf: notificationsEnabled ? 'flex-end' : 'flex-start',
              }} />
            </Pressable>
          </View>
        </SettingSection>

        {/* ===== About Section ===== */}
        <SettingSection title={t("about")}>
          <ThemedText style={{ fontSize: 14, opacity: 0.8, lineHeight: 20 }}>
            {t("aboutLine1")}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.8, lineHeight: 20, marginTop: 8 }}>
            {t("aboutLine2")}
          </ThemedText>
        </SettingSection>
      </ScrollView>

      {/* ===== Edit Name Modal ===== */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <ThemedView style={[styles.modalContent, { borderColor, backgroundColor: cardColor }]}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
              {t("editName")}
            </ThemedText>

            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
              placeholder={t("editName")}
              placeholderTextColor={textColor + "80"}
              value={tempName}
              onChangeText={setTempName}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <ThemedText>{t("closeButton")}</ThemedText>
              </Pressable>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  if (updateUsername) {
                    updateUsername(tempName);
                  }
                  setIsEditModalVisible(false);
                }}
              >
                <ThemedText style={{ color: "#2563eb", fontWeight: "600" }}>
                  {t("success")}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* ===== Avatar Picker ===== */}
      <AvatarPicker
        visible={isAvatarPickerVisible}
        onClose={() => setIsAvatarPickerVisible(false)}
        currentAvatar={userAvatar}
        onSelect={(avatar: UserAvatar) => {
          updateAvatar?.(avatar);
          setIsAvatarPickerVisible(false);
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  userCard: { 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 0, 
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  accountHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: 'center', borderWidth: 1 },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { flex: 1, gap: 2 },
  userEmail: { fontSize: 12, opacity: 0.7 },
  accountMenu: { 
    position: "absolute", top: 40, right: 0, marginTop: 4, borderRadius: 12, borderWidth: 1, zIndex: 9999, elevation: 10, minWidth: 160,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  accountMenuItem: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  dangerText: { color: "#b91c1c", fontWeight: "600" },
  loginBox: { 
    padding: 12, 
    borderRadius: 24, 
    borderWidth: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  rightWithIcon: { flexDirection: "row", alignItems: "center", gap: 4 },
  dropdown: { marginTop: 4, marginBottom: 8, borderRadius: 8, borderWidth: 1, overflow: "hidden" },
  dropdownOption: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, padding: 24, borderRadius: 20, borderWidth: 1, gap: 15 },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16, marginTop: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { padding: 10 }
});
