// components/ui/AppScreen.tsx
import { ThemedView } from '@/components/themed-view';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface AppScreenProps {
  children: ReactNode;
}

export default function AppScreen({ children }: AppScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
