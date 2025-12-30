// app/(tabs)/_layout.tsx
import { AppProviders } from "@/services/Providers";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <AppProviders>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Groups",
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
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AppProviders>
  );
}
