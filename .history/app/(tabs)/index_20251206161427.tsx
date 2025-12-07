// app/(tabs)/index.tsx
import GroupCard, { Group } from '@/components/group/GroupCard';
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { router } from 'expo-router';
import { View } from 'react-native';

const demoGroups: Group[] = [
  { id: '1', name: 'Paris Trip (demo)', membersCount: 3, totalExpenses: 260 },
  { id: '2', name: 'Roommates (demo)', membersCount: 4, totalExpenses: 520 },
];

export default function GroupsScreen() {
  return (
    <AppScreen>
      <AppTopBar
        title="My Groups"
        rightLabel="New"
        onRightPress={() => router.push('/group/new')}
      />

      <ThemedText>
        Create a group for each trip or set of friends, then add expenses.
      </ThemedText>

      {demoGroups.map((g) => (
        <GroupCard key={g.id} group={g} />
      ))}

      {demoGroups.length === 0 && (
        <ThemedText>No groups yet. Tap "New" to create one.</ThemedText>
      )}

      <View style={{ height: 16 }} />
    </AppScreen>
  );
}
