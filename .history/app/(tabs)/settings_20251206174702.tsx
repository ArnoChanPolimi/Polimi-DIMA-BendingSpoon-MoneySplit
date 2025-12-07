// app/(tabs)/settings.tsx
import SettingRow from '@/components/settings/SettingRow';
import SettingSection from '@/components/settings/SettingSection';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';
type Language = 'en' | 'zh';
type Currency = 'EUR' | 'USD' | 'CNY';

export default function SettingsScreen() {
  // ===== 用户登录 Demo 状态 =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');

  // ===== 偏好设置 Demo 状态 =====
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 循环切换枚举的小工具
  const cycleTheme = () => {
    setTheme((prev) =>
      prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system',
    );
  };

  const cycleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  const cycleCurrency = () => {
    setCurrency((prev) =>
      prev === 'EUR' ? 'USD' : prev === 'USD' ? 'CNY' : 'EUR',
    );
  };

  const handleLoginDemo = () => {
    // 这里只是 Demo：真正登录以后要接 Firebase / 自己的后端
    setIsLoggedIn(true);
    setUserName('Hong Chen');
    setEmail('your.email@example.com');
  };

  const handleLogoutDemo = () => {
    setIsLoggedIn(false);
  };

  return (
    <AppScreen>
      <AppTopBar title="Settings" />

      {/* ==== 用户信息区块 ==== */}
      <SettingSection title="Account">
        {isLoggedIn ? (
          <ThemedView style={styles.userCard}>
            <View style={styles.avatar}>
              <ThemedText type="defaultSemiBold">
                {userName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText type="defaultSemiBold">{userName}</ThemedText>
              <ThemedText style={styles.userEmail}>{email}</ThemedText>
            </View>
            <PrimaryButton label="Log out (demo)" onPress={handleLogoutDemo} />
          </ThemedView>
        ) : (
          <ThemedView style={styles.loginBox}>
            <ThemedText style={styles.loginText}>
              You are not signed in.
            </ThemedText>
            <PrimaryButton
              label="Log in / Sign up (demo)"
              onPress={handleLoginDemo}
            />
            <ThemedText style={styles.loginHint}>
              In the real app, this will open an authentication flow (Firebase /
              email / Google, etc.).
            </ThemedText>
          </ThemedView>
        )}
      </SettingSection>

      {/* ==== 主题、语言、货币 ==== */}
      <SettingSection title="Preferences">
        <SettingRow
          title="Theme"
          subtitle="System / Light / Dark"
          onPress={cycleTheme}
          right={
            <ThemedText>
              {theme === 'system'
                ? 'System'
                : theme === 'light'
                ? 'Light'
                : 'Dark'}
            </ThemedText>
          }
        />

        <SettingRow
          title="Language"
          subtitle="App language"
          onPress={cycleLanguage}
          right={
            <ThemedText>
              {language === 'en' ? 'English' : '中文'}
            </ThemedText>
          }
        />

        <SettingRow
          title="Currency"
          subtitle="Default currency for groups"
          onPress={cycleCurrency}
          right={
            <ThemedText>
              {currency === 'EUR'
                ? 'EUR €'
                : currency === 'USD'
                ? 'USD $'
                : 'CNY ¥'}
            </ThemedText>
          }
        />
      </SettingSection>

      {/* ==== 通知设置（对应 idea 里的“notified when expense added/edited”） ==== */}
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

      {/* ==== 项目信息 ==== */}
      <SettingSection title="About this app">
        <ThemedText>
          Shared Expenses App – course project based on Bending Spoons idea.
        </ThemedText>
        <ThemedText>
          This screen currently stores preferences only in local state (demo).
          Later you can connect it to a global store and remote user profile.
        </ThemedText>
      </SettingSection>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  userCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userEmail: {
    fontSize: 12,
    opacity: 0.7,
  },
  loginBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  loginText: {
    marginBottom: 4,
  },
  loginHint: {
    fontSize: 12,
    opacity: 0.7,
  },
});
