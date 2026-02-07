// // app\(tabs)\settings.tsx
// import { useAuth } from "@/components/auth/AuthContext";
// import SettingRow from "@/components/settings/SettingRow";
// import SettingSection from "@/components/settings/SettingSection";
// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";
// import AppScreen from "@/components/ui/AppScreen";
// import AppTopBar from "@/components/ui/AppTopBar";
// import PrimaryButton from "@/components/ui/PrimaryButton";
// import { t } from "@/core/i18n";
// import { useSettings } from "@/core/settings/SettingsContext";
// import { useThemeColor } from "@/hooks/use-theme-color";

// import { Ionicons } from "@expo/vector-icons";
// import { Link, router } from "expo-router";
// import { useMemo, useState } from "react";
// // 修复：确保导入了 Modal 和 TextInput
// import { Alert, Modal, Pressable, StyleSheet, Switch, TextInput, View } from "react-native";

// type Currency = "EUR" | "USD" | "CNY";

// export default function SettingsScreen() {
//   const { user, logout, updateUsername } = useAuth();
//   const { theme, language, setTheme, setLanguage } = useSettings();

//   const borderColor = useThemeColor({}, "border");
//   const cardColor = useThemeColor({}, "card");
//   const textColor = useThemeColor({}, "text");
//   const backgroundColor = useThemeColor({}, "background");

//   const [currency, setCurrency] = useState<Currency>("EUR");
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);

//   const [showThemeDropdown, setShowThemeDropdown] = useState(false);
//   const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
//   const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
//   const [showAccountMenu, setShowAccountMenu] = useState(false);

//   // 状态：控制自定义弹窗
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [tempName, setTempName] = useState("");

//   const themeLabel = useMemo(() => {
//     return theme === "system" ? t("system") : theme === "light" ? t("light") : t("dark");
//   }, [theme]);

//   const languageLabel = useMemo(() => {
//     return language === "en" ? t("english") : language === "zh" ? t("chinese") : t("italian");
//   }, [language]);

//   const currencyLabel =
//     currency === "EUR" ? "EUR €" : currency === "USD" ? "USD $" : "CNY ¥";

//   const userEmail = user?.email ?? "";
//   const userName = user?.displayName || (userEmail ? userEmail.split("@")[0] : "User");
//   const avatarInitial = (userName || "U")[0].toUpperCase();

//   return (
//     <AppScreen>
//       <AppTopBar title={t("settings")} />

//       {/* ===== Account Section ===== */}
//       <View style={{ zIndex: 10, position: 'relative' }}>
//         <SettingSection title={t("account")}>
//           {user ? (
//             <ThemedView style={[styles.userCard, { borderColor, backgroundColor: cardColor }]}>
//               <View style={styles.accountHeaderRow}>
//                 <ThemedText type="defaultSemiBold">{t("signedIn")}</ThemedText>
                
//                 {/* 核心修复：添加 zIndex 确保锚点容器高于下方的 userRow，否则菜单会被头像遮挡 */}
//                 <Pressable hitSlop={15} onPress={() => setShowAccountMenu((p) => !p)}>
//                   <Ionicons name="ellipsis-vertical" size={18} color={textColor} />
//                 </Pressable>
                  
//               </View>

//               <View style={styles.userRow}>
//                 <ThemedView style={[styles.avatar, { backgroundColor: backgroundColor, borderColor }]}>
//                   <ThemedText type="defaultSemiBold">{avatarInitial}</ThemedText>
//                 </ThemedView>

//                 <View style={styles.userInfo}>
//                   <ThemedText type="defaultSemiBold">{userName}</ThemedText>
//                   {!!userEmail && <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>}
//                 </View>
//               </View>
//               {showAccountMenu && (
//                 <ThemedView style={[styles.accountMenu, { borderColor, backgroundColor: cardColor }]}>
//                   <Pressable
//                     style={styles.accountMenuItem}
//                     onPress={() => {
//                       // 1. 先把名字塞进变量
//                       setTempName(user?.displayName || ""); 
                      
//                       // 2. 先把弹窗打开
//                       setIsEditModalVisible(true); 
                      
//                       // 3. 最后再关掉菜单
//                       setShowAccountMenu(false);
//                     }}
//                   >
//                     <Ionicons name="create-outline" size={16} color={textColor} style={styles.accountMenuIcon} />
//                     <ThemedText>{t("editName")}</ThemedText>
//                   </Pressable>

//                   <Pressable
//                     style={styles.accountMenuItem}
//                     onPress={() => {
//                       setShowAccountMenu(false);
//                       router.push("/auth/login");
//                     }}
//                   >
//                     <Ionicons name="people-outline" size={16} color={textColor} style={styles.accountMenuIcon} />
//                     <ThemedText>{t("switchAccount")}</ThemedText>
//                   </Pressable>

//                   <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 8, opacity: 0.2 }} />

//                   <Pressable
//                     style={styles.accountMenuItem}
//                     onPress={async () => {
//                       setShowAccountMenu(false);
//                       await logout();
//                     }}
//                   >
//                     <Ionicons name="log-out-outline" size={16} color={textColor} style={styles.accountMenuIcon} />
//                     <ThemedText style={styles.dangerText}>{t("logout")}</ThemedText>
//                   </Pressable>
//                 </ThemedView>
//               )}
//             </ThemedView>
//           ) : (
//             <ThemedView style={[styles.loginBox, { borderColor, backgroundColor: cardColor }]}>
//               <ThemedText style={styles.loginText}>{t("notSignedIn")}</ThemedText>
//               <Link href="/auth/login" asChild>
//                 <PrimaryButton label={t("login")} onPress={() => {}} />
//               </Link>
//               <View style={{ height: 8 }} />
//               <Link href="/auth/signup" asChild>
//                 <PrimaryButton label={t("signup")} onPress={() => router.push("/auth/signup")} />
//               </Link>
//             </ThemedView>
//           )}
//         </SettingSection>
//       </View>

//       {/* ===== Preferences Section ===== */}
//       <SettingSection title={t("preferences")}>
//         <SettingRow
//           title={t("theme")}
//           subtitle={t("themeSubtitle")}
//           onPress={() => {
//             setShowThemeDropdown(!showThemeDropdown);
//             setShowLanguageDropdown(false);
//             setShowCurrencyDropdown(false);
//           }}
//           right={
//             <ThemedView style={styles.rightWithIcon}>
//               <ThemedText>{themeLabel}</ThemedText>
//               <Ionicons name={showThemeDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={textColor} />
//             </ThemedView>
//           }
//         />
//         {showThemeDropdown && (
//           <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
//             <DropdownOption label={t("system")} selected={theme === "system"} onPress={async () => { await setTheme("system"); setShowThemeDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//             <DropdownOption label={t("light")} selected={theme === "light"} onPress={async () => { await setTheme("light"); setShowThemeDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//             <DropdownOption label={t("dark")} selected={theme === "dark"} onPress={async () => { await setTheme("dark"); setShowThemeDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//           </ThemedView>
//         )}

//         <SettingRow
//           title={t("language")}
//           subtitle={t("appLanguage")}
//           onPress={() => {
//             setShowLanguageDropdown(!showLanguageDropdown);
//             setShowThemeDropdown(false);
//             setShowCurrencyDropdown(false);
//           }}
//           right={
//             <ThemedView style={styles.rightWithIcon}>
//               <ThemedText>{languageLabel}</ThemedText>
//               <Ionicons name={showLanguageDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={textColor} />
//             </ThemedView>
//           }
//         />
//         {showLanguageDropdown && (
//           <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
//             <DropdownOption label={t("english")} selected={language === "en"} onPress={async () => { await setLanguage("en"); setShowLanguageDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//             <DropdownOption label={t("chinese")} selected={language === "zh"} onPress={async () => { await setLanguage("zh"); setShowLanguageDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//             <DropdownOption label={t("italian")} selected={language === "it"} onPress={async () => { await setLanguage("it"); setShowLanguageDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//           </ThemedView>
//         )}

//         <SettingRow
//           title={t("currency")}
//           subtitle={t("defaultCurrency")}
//           onPress={() => {
//             setShowCurrencyDropdown(!showCurrencyDropdown);
//             setShowThemeDropdown(false);
//             setShowLanguageDropdown(false);
//           }}
//           right={
//             <ThemedView style={styles.rightWithIcon}>
//               <ThemedText>{currencyLabel}</ThemedText>
//               <Ionicons name={showCurrencyDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={textColor} />
//             </ThemedView>
//           }
//         />
//         {showCurrencyDropdown && (
//           <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
//             <DropdownOption label="EUR €" selected={currency === "EUR"} onPress={() => { setCurrency("EUR"); setShowCurrencyDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//             <DropdownOption label="USD $" selected={currency === "USD"} onPress={() => { setCurrency("USD"); setShowCurrencyDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//             <DropdownOption label="CNY ¥" selected={currency === "CNY"} onPress={() => { setCurrency("CNY"); setShowCurrencyDropdown(false); }} borderColor={borderColor} textColor={textColor} />
//           </ThemedView>
//         )}
//       </SettingSection>

//       {/* ===== Notifications ===== */}
//       <SettingSection title={t("notifications")}>
//         <SettingRow
//           title={t("expenseChanges")}
//           subtitle={t("notifyExpense")}
//           right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
//         />
//       </SettingSection>

//       {/* ===== About ===== */}
//       <SettingSection title={t("about")}>
//         <ThemedText>Shared Expenses App — course project based on a Bending Spoons idea.</ThemedText>
//         <ThemedText>These settings are demo-only; you may persist them to a backend later.</ThemedText>
//       </SettingSection>

//       {/* 自定义改名弹窗 */}
//       <Modal visible={isEditModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <ThemedView style={[styles.modalContent, { borderColor, backgroundColor: cardColor }]}>
//             <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>Edit Username</ThemedText>
//             <TextInput
//               style={[styles.input, { color: textColor, borderColor }]}
//               value={tempName}
//               onChangeText={setTempName}
//               autoFocus
//             />
//             <View style={styles.modalButtons}>
//               <Pressable onPress={() => setIsEditModalVisible(false)} style={styles.modalBtn}>
//                 <ThemedText style={{ color: "#888" }}>Cancel</ThemedText>
//               </Pressable>
//               <Pressable 
//                 style={styles.modalBtn}
//                 onPress={async () => {
//                   const trimmed = tempName.trim();
//                   if (trimmed.length < 2 || trimmed.length > 20) {
//                     Alert.alert("Error", "Name must be 2-20 characters.");
//                     return;
//                   }
//                   try {
//                     await updateUsername(trimmed);
//                     setIsEditModalVisible(false);
//                   } catch (e: any) {
//                     Alert.alert("Error", "Update failed");
//                   }
//                 }}
//               >
//                 <ThemedText style={{ color: "#0a7ea4", fontWeight: 'bold' }}>Save</ThemedText>
//               </Pressable>
//             </View>
//           </ThemedView>
//         </View>
//       </Modal>
//     </AppScreen>
//   );
// }

// /* ---------------- Dropdown Option Component ---------------- */
// interface DropdownOptionProps {
//   label: string;
//   selected: boolean;
//   onPress: () => void;
//   borderColor: string;
//   textColor: string;
// }

// function DropdownOption({ label, selected, onPress, borderColor, textColor }: DropdownOptionProps) {
//   return (
//     <Pressable onPress={onPress}>
//       <ThemedView style={[styles.dropdownOption, { borderBottomColor: borderColor }]}>
//         <ThemedText>{label}</ThemedText>
//         {selected && <Ionicons name="checkmark-outline" size={16} color={textColor} />}
//       </ThemedView>
//     </Pressable>
//   );
// }

// /* ---------------- Styles ---------------- */
// /* ---------------- Styles ---------------- */
// const styles = StyleSheet.create({
//   // --- 1. 用户卡片基础样式 (已补齐 zIndex) ---
//   userCard: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 8, position: "relative", zIndex: 100, overflow: "visible"},
//   accountHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   userRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
//   avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
//   userInfo: { flex: 1, gap: 2 },
//   userEmail: { fontSize: 12, opacity: 0.7 },

//   // --- 2. 修复后的操作菜单 (自适应定位) ---
//   // --- 2. 修复后的操作菜单 (自适应定位) ---
//   accountMenu: { 
//     position: "absolute", 
//     top: 40, // "100%", 
//     right: 0, 
//     marginTop: 4,
//     borderRadius: 12, 
//     borderWidth: 1, 
//     zIndex: 9999,      // 确保在 Web/iOS 层级最高
//     elevation: 10,     // 确保在 Android 层级最高
//     minWidth: 160,
//     // 建议增加以下三行，让它在浅色模式下有立体感，不至于和背景混在一起
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   accountMenuItem: { 
//     paddingHorizontal: 16, 
//     paddingVertical: 12, 
//     flexDirection: "row", 
//     alignItems: "center", 
//     gap: 10 
//   },
//   accountMenuIcon: { opacity: 0.9 },
//   dangerText: { color: "#b91c1c", fontWeight: "600" },

//   // --- 3. 【之前被我删掉的零件，现在全部补回！】 ---
//   loginBox: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 8 },
//   loginText: { marginBottom: 4 },
//   rightWithIcon: { flexDirection: "row", alignItems: "center", gap: 4 },
//   dropdown: { marginTop: 4, marginBottom: 8, borderRadius: 8, borderWidth: 1, overflow: "hidden" },
//   dropdownOption: { 
//     paddingHorizontal: 12, 
//     paddingVertical: 8, 
//     flexDirection: "row", 
//     justifyContent: "space-between", 
//     alignItems: "center", 
//     borderBottomWidth: 1 
//   },

//   // --- 4. 弹窗样式 ---
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
//   modalContent: { width: '85%', maxWidth: 400, padding: 24, borderRadius: 20, borderWidth: 1, gap: 15 },
//   input: { borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16, marginTop: 10 },
//   modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
//   modalBtn: { padding: 10 }
// });
// 粘贴到 app/(tabs)/settings.tsx
// 这一次，我保证 Account Menu、Theme Toggle、Name Edit 全部在线

import { useAuth } from "@/components/auth/AuthContext";
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

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";

type Currency = "EUR" | "USD" | "CNY";

export default function SettingsScreen() {
  const { user, logout, updateUsername } = useAuth();
  const { theme, language, setTheme, setLanguage } = useSettings();

  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const [currency, setCurrency] = useState<Currency>("EUR");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 核心 UI 交互状态：保留，不可删除
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // 改名 Modal 状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");

  const themeLabel = useMemo(() => {
    return theme === "system" ? t("system") : theme === "light" ? t("light") : t("dark");
  }, [theme]);

  const languageLabel = useMemo(() => {
    return language === "en" ? t("english") : language === "zh" ? t("chinese") : t("italian");
  }, [language]);

  const currencyLabel = currency === "EUR" ? "EUR €" : currency === "USD" ? "USD $" : "CNY ¥";

  const userEmail = user?.email ?? "";
  const userName = user?.displayName || (userEmail ? userEmail.split("@")[0] : "User");
  const avatarInitial = (userName || "U")[0].toUpperCase();

  return (
    <AppScreen>
      <AppTopBar title={t("settings")} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* ===== 账户区块 (Account Section) ===== */}
        <View style={{ zIndex: 100, position: 'relative' }}>
          <SettingSection title={t("account")}>
            {user ? (
              <ThemedView style={[styles.userCard, { borderColor, backgroundColor: cardColor }]}>
                <View style={styles.accountHeaderRow}>
                  <ThemedText type="defaultSemiBold">{t("signedIn")}</ThemedText>
                  <Pressable hitSlop={15} onPress={() => setShowAccountMenu((p) => !p)}>
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

                {/* 悬浮菜单：编辑名字、切换账户、登出 */}
                {showAccountMenu && (
                  <ThemedView style={[styles.accountMenu, { borderColor, backgroundColor: cardColor }]}>
                    <Pressable style={styles.accountMenuItem} onPress={() => {
                      setTempName(user?.displayName || ""); 
                      setIsEditModalVisible(true); 
                      setShowAccountMenu(false);
                    }}>
                      <Ionicons name="create-outline" size={16} color={textColor} />
                      <ThemedText>{t("editName")}</ThemedText>
                    </Pressable>
                    <Pressable style={styles.accountMenuItem} onPress={() => {
                      setShowAccountMenu(false);
                      router.push("/auth/login");
                    }}>
                      <Ionicons name="people-outline" size={16} color={textColor} />
                      <ThemedText>{t("switchAccount")}</ThemedText>
                    </Pressable>
                    <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 8, opacity: 0.2 }} />
                    <Pressable style={styles.accountMenuItem} onPress={async () => {
                      setShowAccountMenu(false);
                      await logout();
                    }}>
                      <Ionicons name="log-out-outline" size={16} color={textColor} />
                      <ThemedText style={styles.dangerText}>{t("logout")}</ThemedText>
                    </Pressable>
                  </ThemedView>
                )}
              </ThemedView>
            ) : (
              <ThemedView style={[styles.loginBox, { borderColor, backgroundColor: cardColor }]}>
                <PrimaryButton label={t("login")} onPress={() => router.push("/auth/login")} />
                <View style={{ height: 8 }} />
                <PrimaryButton label={t("signup")} onPress={() => router.push("/auth/signup")} />
              </ThemedView>
            )}
          </SettingSection>
        </View>

        {/* ===== 偏好设置 (Preferences Section) ===== */}
        <SettingSection title={t("preferences")}>
          {/* 主题切换 */}
          <SettingRow
            title={t("theme")}
            subtitle={t("themeSubtitle")}
            onPress={() => { setShowThemeDropdown(!showThemeDropdown); setShowLanguageDropdown(false); setShowCurrencyDropdown(false); }}
            right={
              <View style={styles.rightWithIcon}>
                <ThemedText>{themeLabel}</ThemedText>
                <Ionicons name={showThemeDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={textColor} />
              </View>
            }
          />
          {showThemeDropdown && (
            <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
              <DropdownOption label={t("system")} selected={theme === "system"} onPress={async () => { await setTheme("system"); setShowThemeDropdown(false); }} borderColor={borderColor} textColor={textColor} />
              <DropdownOption label={t("light")} selected={theme === "light"} onPress={async () => { await setTheme("light"); setShowThemeDropdown(false); }} borderColor={borderColor} textColor={textColor} />
              <DropdownOption label={t("dark")} selected={theme === "dark"} onPress={async () => { await setTheme("dark"); setShowThemeDropdown(false); }} borderColor={borderColor} textColor={textColor} />
            </ThemedView>
          )}

          {/* 语言切换 */}
          <SettingRow
            title={t("language")}
            subtitle={t("appLanguage")}
            onPress={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowThemeDropdown(false); setShowCurrencyDropdown(false); }}
            right={
              <View style={styles.rightWithIcon}>
                <ThemedText>{languageLabel}</ThemedText>
                <Ionicons name={showLanguageDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={textColor} />
              </View>
            }
          />
          {showLanguageDropdown && (
            <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
              <DropdownOption label={t("english")} selected={language === "en"} onPress={async () => { await setLanguage("en"); setShowLanguageDropdown(false); }} borderColor={borderColor} textColor={textColor} />
              <DropdownOption label={t("chinese")} selected={language === "zh"} onPress={async () => { await setLanguage("zh"); setShowLanguageDropdown(false); }} borderColor={borderColor} textColor={textColor} />
              <DropdownOption label={t("italian")} selected={language === "it"} onPress={async () => { await setLanguage("it"); setShowLanguageDropdown(false); }} borderColor={borderColor} textColor={textColor} />
            </ThemedView>
          )}

          {/* 货币切换 */}
          <SettingRow
            title={t("currency")}
            subtitle={t("defaultCurrency")}
            onPress={() => { setShowCurrencyDropdown(!showCurrencyDropdown); setShowThemeDropdown(false); setShowLanguageDropdown(false); }}
            right={
              <View style={styles.rightWithIcon}>
                <ThemedText>{currencyLabel}</ThemedText>
                <Ionicons name={showCurrencyDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={textColor} />
              </View>
            }
          />
          {showCurrencyDropdown && (
            <ThemedView style={[styles.dropdown, { borderColor, backgroundColor: cardColor }]}>
              <DropdownOption label="EUR €" selected={currency === "EUR"} onPress={() => { setCurrency("EUR"); setShowCurrencyDropdown(false); }} borderColor={borderColor} textColor={textColor} />
              <DropdownOption label="USD $" selected={currency === "USD"} onPress={() => { setCurrency("USD"); setShowCurrencyDropdown(false); }} borderColor={borderColor} textColor={textColor} />
              <DropdownOption label="CNY ¥" selected={currency === "CNY"} onPress={() => { setCurrency("CNY"); setShowCurrencyDropdown(false); }} borderColor={borderColor} textColor={textColor} />
            </ThemedView>
          )}
        </SettingSection>

        {/* ===== 通知 (Notifications) ===== */}
        <SettingSection title={t("notifications")}>
          <SettingRow
            title={t("expenseChanges")}
            subtitle={t("notifyExpense")}
            right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
          />
        </SettingSection>

        {/* ===== 关于 (About) ===== */}
        <SettingSection title={t("about")}>
          <ThemedText style={{ opacity: 0.6 }}>Shared Expenses App — Course project.</ThemedText>
        </SettingSection>
      </ScrollView>

      {/* 修改名字弹窗 */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { borderColor, backgroundColor: cardColor }]}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>Edit Username</ThemedText>
            <TextInput style={[styles.input, { color: textColor, borderColor }]} value={tempName} onChangeText={setTempName} autoFocus />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setIsEditModalVisible(false)} style={styles.modalBtn}>
                <ThemedText style={{ color: "#888" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={async () => {
                try {
                  await updateUsername(tempName.trim());
                  setIsEditModalVisible(false);
                } catch (e) {
                  Alert.alert("Error", "Update failed");
                }
              }}>
                <ThemedText style={{ color: "#0a7ea4", fontWeight: 'bold' }}>Save</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </AppScreen>
  );
}

function DropdownOption({ label, selected, onPress, borderColor, textColor }: any) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={[styles.dropdownOption, { borderBottomColor: borderColor }]}>
        <ThemedText>{label}</ThemedText>
        {selected && <Ionicons name="checkmark-outline" size={16} color={textColor} />}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userCard: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 8, position: "relative", zIndex: 100 },
  accountHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: 'center', borderWidth: 1 },
  userInfo: { flex: 1, gap: 2 },
  userEmail: { fontSize: 12, opacity: 0.7 },
  accountMenu: { 
    position: "absolute", top: 40, right: 0, marginTop: 4, borderRadius: 12, borderWidth: 1, zIndex: 9999, elevation: 10, minWidth: 160,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  accountMenuItem: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  dangerText: { color: "#b91c1c", fontWeight: "600" },
  loginBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  rightWithIcon: { flexDirection: "row", alignItems: "center", gap: 4 },
  dropdown: { marginTop: 4, marginBottom: 8, borderRadius: 8, borderWidth: 1, overflow: "hidden" },
  dropdownOption: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, padding: 24, borderRadius: 20, borderWidth: 1, gap: 15 },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16, marginTop: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { padding: 10 }
});