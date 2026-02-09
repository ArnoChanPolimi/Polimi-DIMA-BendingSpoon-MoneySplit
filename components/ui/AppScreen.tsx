// components/ui/AppScreen.tsx
import { ThemedView } from "@/components/themed-view";
import { useSettings } from "@/core/settings/SettingsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ReactNode } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RefreshControl from "./RefreshControl";

// 背景图片
const BACKGROUND_IMAGE = require("@/assets/images/background.jpg");

// 背景遮罩透明度 - light 模式
const LIGHT_OVERLAY_OPACITY = 0.4;
// 背景遮罩透明度 - dark 模式 (更高的不透明度来压暗背景)
const DARK_OVERLAY_OPACITY = 0.75;

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
  /**
   * Whether to show background image
   */
  showBackground?: boolean;
}

export default function AppScreen({ 
  children, 
  isRefreshing = false,
  onRefresh,
  showBackground = true
}: AppScreenProps) {
  // ✅ 关键：取主题背景色
  const backgroundColor = useThemeColor({}, "background");
  const { resolvedTheme } = useSettings();
  
  // 根据主题选择遮罩颜色和透明度
  const isDark = resolvedTheme === "dark";
  const overlayColor = isDark ? "rgba(0, 0, 0, " + DARK_OVERLAY_OPACITY + ")" : "rgba(255, 255, 255, " + LIGHT_OVERLAY_OPACITY + ")";

  const content = (
    <ThemedView style={[styles.container, showBackground && styles.transparentBg]}>
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
  );

  if (showBackground) {
    return (
      <ImageBackground
        source={BACKGROUND_IMAGE}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* 半透明遮罩层 - 根据主题调整 */}
        <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
        <SafeAreaView
          style={styles.safeArea}
          edges={["top", "left", "right", "bottom"]}
        >
          {content}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "left", "right", "bottom"]}
    >
      {content}
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
  transparentBg: {
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});