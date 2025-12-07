// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,          // 不要顶部默认标题栏
        tabBarActiveTintColor: '#2563eb', // 选中的蓝色
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />

      {/* 如果你项目里还有 explore.tsx，又不想要这个 tab，可以这样隐藏： */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // 这样它不会出现在底部 tab 里
        }}
      />
    </Tabs>
  );
}
