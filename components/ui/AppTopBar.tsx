// components/ui/AppTopBar.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

type AppTopBarProps = {
  title: string;
  showBack?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
};

export default function AppTopBar({
  title,
  showBack = false,
  rightLabel,
  onRightPress,
  rightIconName,
  onRightIconPress,
}: AppTopBarProps) {
  return (
    <ThemedView style={styles.container}>
      {/* 左侧：可选返回按钮 */}
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={20} />
          </Pressable>
        )}
      </View>

      {/* 中间：标题 */}
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      {/* 右侧：文字按钮 + 图标按钮 */}
      <View style={styles.right}>
        {rightLabel && (
          <Pressable
            onPress={onRightPress}
            style={styles.rightLabelWrapper}
          >
            <ThemedText type="defaultSemiBold" style={styles.rightLabel}>
              {rightLabel}
            </ThemedText>
          </Pressable>
        )}

        {rightIconName && (
          <Pressable onPress={onRightIconPress} style={styles.iconWrapper}>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  right: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  rightLabelWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rightLabel: {
    fontSize: 14,
  },
  iconWrapper: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
