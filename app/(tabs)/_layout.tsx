// app/(tabs)/_layout.tsx
import { t } from "@/core/i18n";
import { useSettings } from "@/core/settings/SettingsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AppProviders } from "@/services/Providers";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  // 关键：让这个组件在语言切换时重新渲染，title 才会变
  const { language } = useSettings();

  // 主题化 tab bar 颜色
  const backgroundColor = useThemeColor({}, "background");
  const activeTintColor = useThemeColor({}, "primary");
  const inactiveTintColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "border");

  return (
    <AppProviders>
      <Tabs
        key={`tabs-${language}`}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeTintColor,
          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor,
            borderTopColor: borderColor,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("groups"),
            tabBarLabel: t("groups"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quick-add"
          options={{
            title: "",
            tabBarLabel: "",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size + 6} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings"),
            tabBarLabel: t("settings"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AppProviders>
  );
}