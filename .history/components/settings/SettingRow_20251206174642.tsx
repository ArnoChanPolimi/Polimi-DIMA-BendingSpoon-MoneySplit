// components/settings/SettingRow.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode; // 右侧可以放 Switch、文字等
}

export default function SettingRow({ title, subtitle, onPress, right }: Props) {
  const content = (
    <ThemedView style={styles.row}>
      <View style={styles.left}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    gap: 2,
  },
  right: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});
