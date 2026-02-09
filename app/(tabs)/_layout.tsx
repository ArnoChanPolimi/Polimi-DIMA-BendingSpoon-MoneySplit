// app/(tabs)/_layout.tsx
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useSettings } from "@/core/settings/SettingsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AppProviders } from "@/services/Providers";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

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
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "",
            tabBarLabel: "",
            tabBarIcon: ({ color, size }) => (
              <PixelIcon name="groups" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quick-add"
          options={{
            title: "",
            tabBarLabel: "",
            tabBarIcon: ({ color, size }) => (
              <PixelIcon name="add" size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "",
            tabBarLabel: "",
            tabBarIcon: ({ color, size }) => (
              <PixelIcon name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AppProviders>
  );
}