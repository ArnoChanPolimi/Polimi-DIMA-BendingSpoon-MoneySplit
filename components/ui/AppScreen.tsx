// components/ui/AppScreen.tsx
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RefreshControl from "./RefreshControl";

interface AppScreenProps {
  children: ReactNode;
  /**
   * Whether a refresh operation is in progress
   */
  isRefreshing?: boolean;
  /**
   * Callback when user pulls down to refresh
   */
  onRefresh?: () => void | Promise<void>;
}

export default function AppScreen({ 
  children, 
  isRefreshing = false,
  onRefresh 
}: AppScreenProps) {
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
          refreshControl={
            onRefresh ? (
              <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={onRefresh}
              />
            ) : undefined
          }
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