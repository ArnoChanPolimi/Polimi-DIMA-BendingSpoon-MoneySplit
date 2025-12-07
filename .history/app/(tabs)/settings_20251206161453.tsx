// app/(tabs)/settings.tsx
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <AppScreen>
      <AppTopBar title="Settings / About" />

      <ThemedText type="subtitle">Project</ThemedText>
      <ThemedText style={styles.block}>
        Shared Expenses App – based on Bending Spoons idea.
      </ThemedText>

      <ThemedText type="subtitle">Team</ThemedText>
      <ThemedText>- Hong Chen (填你的学号 / 邮箱)</ThemedText>
      <ThemedText>- Teammate 1</ThemedText>
      <ThemedText>- Teammate 2</ThemedText>

      <ThemedText type="subtitle" style={styles.section}>
        Future settings
      </ThemedText>
      <ThemedText>• Default currency (EUR, CNY...)</ThemedText>
      <ThemedText>• Notifications on/off</ThemedText>
      <ThemedText>• Language</ThemedText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 12,
  },
  section: {
    marginTop: 16,
  },
});
