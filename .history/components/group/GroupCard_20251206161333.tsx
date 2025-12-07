// components/group/GroupCard.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export type Group = {
  id: string;
  name: string;
  membersCount: number;
  totalExpenses: number;
};

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Pressable onPress={() => router.push(`/group/${group.id}`)}>
      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">{group.name}</ThemedText>

        <View style={styles.row}>
          <ThemedText>
            {group.membersCount} members · {group.totalExpenses.toFixed(2)} €
          </ThemedText>
        </View>

        <ThemedText type="default" style={styles.hint}>
          Tap to see balances and expenses
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
});
