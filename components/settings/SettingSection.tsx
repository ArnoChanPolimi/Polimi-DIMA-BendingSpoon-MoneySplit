// components/settings/SettingSection.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

interface Props {
  title: string;
  children: ReactNode;
}

export default function SettingSection({ title, children }: Props) {
  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    marginBottom: 4,
  },
});
