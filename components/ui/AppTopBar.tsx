// components/ui/AppTopBar.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type AppTopBarProps = {
  title: string;
  showBack?: boolean;
  /** ✅ 新增：可以自己决定返回去哪儿 */
  onBackPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
};

export default function AppTopBar({
  title,
  showBack = false,
  onBackPress,
  rightLabel,
  onRightPress,
  rightIconName,
  onRightIconPress,
}: AppTopBarProps) {
  return (
    <ThemedView style={styles.container}>
      {/* 左侧：可选返回按钮，占位保证标题居中 */}
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={onBackPress ?? (() => router.back())}
            hitSlop={10}
          >
            <Ionicons name="chevron-back-outline" size={20} />
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.right}>
        {rightLabel && (
          <Pressable
            onPress={onRightPress}
            style={styles.rightLabelWrapper}
            hitSlop={10}
          >
            <ThemedText type="defaultSemiBold" style={styles.rightLabel}>
              {rightLabel}
            </ThemedText>
          </Pressable>
        )}

        {rightIconName && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.iconWrapper}
            hitSlop={10}
          >
            <Ionicons name={rightIconName} size={22} />
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  left: {
    width: 40,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  right: {
    width: 80,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  rightLabelWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  rightLabel: {
    fontSize: 14,
  },
  iconWrapper: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
