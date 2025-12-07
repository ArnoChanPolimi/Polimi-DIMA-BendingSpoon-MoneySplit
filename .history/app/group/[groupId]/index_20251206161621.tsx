// app/group/[groupId]/index.tsx
import BalanceRow, { Balance } from '@/components/expense/BalanceRow';
import ExpenseRow, { Expense } from '@/components/expense/ExpenseRow';
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const demoBalances: Balance[] = [
  { userName: 'Alice', netAmount: 20 },
  { userName: 'Bob', netAmount: -5 },
  { userName: 'Charlie', netAmount: -15 },
];

const demoExpenses: Expense[] = [
  {
    id: 'e1',
    title: 'Dinner',
    amount: 45,
    paidBy: 'Alice',
    date: '2025-02-01',
  },
  {
    id: 'e2',
    title: 'Uber',
    amount: 18,
    paidBy: 'Bob',
    date: '2025-02-02',
  },
];

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const id = String(groupId ?? '');

  return (
    <AppScreen>
      <AppTopBar
        title={`Group #${id}`}
        showBack
        rightLabel="Members"
        onRightPress={() => {
          // TODO: 将来做 edit-members 页面
          console.log('Edit members for group', id);
        }}
      />

      {/* Balances */}
      <View style={styles.section}>
        <ThemedText type="subtitle">Current balances</ThemedText>
        <ThemedText>
          Demo data: who should pay or receive within this group.
        </ThemedText>

        {demoBalances.map((b) => (
          <BalanceRow key={b.userName} balance={b} />
        ))}
      </View>

      {/* Expenses */}
      <View style={styles.section}>
        <ThemedText type="subtitle">Expenses</ThemedText>
        {demoExpenses.map((e) => (
          <ExpenseRow key={e.id} expense={e} />
        ))}
      </View>

      <PrimaryButton
        label="Add expense"
        onPress={() => router.push(`/group/${id}/add-expense`)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
});
