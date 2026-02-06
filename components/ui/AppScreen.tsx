// components/ui/AppScreen.tsx
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppScreenProps {
  children: ReactNode;
}

export default function AppScreen({ children }: AppScreenProps) {
  // ✅ 关键：取主题背景色
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      // 原本的安全区域逻辑一字不动
      edges={["top", "left", "right", "bottom"]}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
});