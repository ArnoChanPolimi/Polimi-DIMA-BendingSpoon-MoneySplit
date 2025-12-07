// components/ui/AppTopBar.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

interface AppTopBarProps {
  title: string;
  showBack?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
}

export default function AppTopBar({
  title,
  showBack = false,
  rightLabel,
  onRightPress,
}: AppTopBarProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={() => router.back()}>
            <ThemedText type="defaultSemiBold">{'< Back'}</ThemedText>
          </Pressable>
        )}
      </View>

      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.right}>
        {rightLabel && onRightPress && (
          <Pressable onPress={onRightPress}>
            <ThemedText type="defaultSemiBold">{rightLabel}</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  left: {
    width: 70,
  },
  right: {
    width: 70,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
