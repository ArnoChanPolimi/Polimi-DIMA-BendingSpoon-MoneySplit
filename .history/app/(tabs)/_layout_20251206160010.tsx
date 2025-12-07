// app/(tabs)/_layout.tsx
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="people" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="notifications" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
