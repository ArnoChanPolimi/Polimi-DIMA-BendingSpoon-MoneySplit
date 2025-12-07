// components/ui/AppTopBar.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

type AppTopBarProps = {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap; // 例如 'chatbubbles-outline'
  onRightIconPress?: () => void;
};

export default function AppTopBar({
  title,
  rightLabel,
  onRightPress,
  rightIconName,
  onRightIconPress,
}: AppTopBarProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.right}>
        {rightLabel && (
          <Pressable onPress={onRightPress} style={styles.rightLabelWrapper}>
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
  title: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
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
