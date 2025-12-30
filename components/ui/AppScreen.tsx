// components/ui/AppScreen.tsx
import { ThemedView } from '@/components/themed-view';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppScreenProps {
  children: ReactNode;
}

export default function AppScreen({ children }: AppScreenProps) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      // 只管上、左、右的安全区域，底下留给 TabBar
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false} // 可选，美观
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
    paddingVertical: 16,   // 这里也顺便留一点上下空隙
    gap: 16,
  },
});
