// app/(tabs)/settings.tsx
import SettingRow from '@/components/settings/SettingRow';
import SettingSection from '@/components/settings/SettingSection';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Switch,
    View
} from 'react-native';

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

  // 下拉框展开 / 收起状态
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const handleLoginDemo = () => {
    setIsLoggedIn(true);
    setUserName('Hong Chen');
    setEmail('your.email@example.com');
  };

  const handleLogoutDemo = () => {
    setIsLoggedIn(false);
  };

  const themeLabel =
    theme === 'system' ? 'Follow System' : theme === 'light' ? 'Light' : 'Dark';

  const languageLabel = language === 'en' ? 'English' : '中文';

  const currencyLabel =
    currency === 'EUR'
      ? 'EUR €'
      : currency === 'USD'
      ? 'USD $'
      : 'CNY ¥';

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

      {/* ==== 主题、语言、货币：下拉选择 ==== */}
      <SettingSection title="Preferences">
        {/* Theme 下拉行 */}
        <SettingRow
          title="Theme"
          subtitle="System / Light / Dark"
          onPress={() => {
            setShowThemeDropdown((prev) => !prev);
            setShowLanguageDropdown(false);
            setShowCurrencyDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{themeLabel}</ThemedText>
              <Ionicons
                name={showThemeDropdown ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={16}
              />
            </ThemedView>
          }
        />
        {showThemeDropdown && (
          <ThemedView style={styles.dropdown}>
            <DropdownOption
              label="Follow system"
              selected={theme === 'system'}
              onPress={() => {
                setTheme('system');
                setShowThemeDropdown(false);
              }}
            />
            <DropdownOption
              label="Light"
              selected={theme === 'light'}
              onPress={() => {
                setTheme('light');
                setShowThemeDropdown(false);
              }}
            />
            <DropdownOption
              label="Dark"
              selected={theme === 'dark'}
              onPress={() => {
                setTheme('dark');
                setShowThemeDropdown(false);
              }}
            />
          </ThemedView>
        )}

        {/* Language 下拉行 */}
        <SettingRow
          title="Language"
          subtitle="App language"
          onPress={() => {
            setShowLanguageDropdown((prev) => !prev);
            setShowThemeDropdown(false);
            setShowCurrencyDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{languageLabel}</ThemedText>
              <Ionicons
                name={
                  showLanguageDropdown ? 'chevron-up-outline' : 'chevron-down-outline'
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
              selected={language === 'en'}
              onPress={() => {
                setLanguage('en');
                setShowLanguageDropdown(false);
              }}
            />
            <DropdownOption
              label="中文"
              selected={language === 'zh'}
              onPress={() => {
                setLanguage('zh');
                setShowLanguageDropdown(false);
              }}
            />
          </ThemedView>
        )}

        {/* Currency 下拉行 */}
        <SettingRow
          title="Currency"
          subtitle="Default currency for groups"
          onPress={() => {
            setShowCurrencyDropdown((prev) => !prev);
            setShowThemeDropdown(false);
            setShowLanguageDropdown(false);
          }}
          right={
            <ThemedView style={styles.rightWithIcon}>
              <ThemedText>{currencyLabel}</ThemedText>
              <Ionicons
                name={
                  showCurrencyDropdown ? 'chevron-up-outline' : 'chevron-down-outline'
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
              selected={currency === 'EUR'}
              onPress={() => {
                setCurrency('EUR');
                setShowCurrencyDropdown(false);
              }}
            />
            <DropdownOption
              label="USD $"
              selected={currency === 'USD'}
              onPress={() => {
                setCurrency('USD');
                setShowCurrencyDropdown(false);
              }}
            />
            <DropdownOption
              label="CNY ¥"
              selected={currency === 'CNY'}
              onPress={() => {
                setCurrency('CNY');
                setShowCurrencyDropdown(false);
              }}
            />
          </ThemedView>
        )}
      </SettingSection>

      {/* ==== 通知设置 ==== */}
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
          These settings are demo-only. Later you can persist them to global
          state and remote user profile.
        </ThemedText>
      </SettingSection>
    </AppScreen>
  );
}

// ===== 下拉框里的单个选项 =====
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
        {selected && (
          <Ionicons name="checkmark-outline" size={16} />
        )}
      </ThemedView>
    </Pressable>
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
  rightWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdown: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
