// app/(tabs)/activity.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { StyleSheet } from 'react-native';

const demoActivities = [
  'Alice added "Dinner" (45 €) to Paris Trip',
  'Bob edited "Uber" in Roommates',
  'Charlie settled the balance in Paris Trip',
];

export default function ActivityScreen() {
  return (
    <AppScreen>
      <AppTopBar title="Activity" />

      <ThemedText>
        Here you will see a feed of expense additions and edits.
      </ThemedText>

      {demoActivities.map((text, idx) => (
        <ThemedView key={idx} style={styles.item}>
          <ThemedText>{text}</ThemedText>
          <ThemedText style={styles.time}>Just now (demo)</ThemedText>
        </ThemedView>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 4,
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
  },
});
