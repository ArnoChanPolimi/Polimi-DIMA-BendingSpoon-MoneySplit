// components/expense/ExpenseRow.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, View } from 'react-native';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
};

interface ExpenseRowProps {
  expense: Expense;
}

export default function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <ThemedView style={styles.row}>
      <View style={styles.left}>
        <ThemedText type="defaultSemiBold">{expense.title}</ThemedText>
        <ThemedText style={styles.sub}>
          Paid by {expense.paidBy} · {expense.date}
        </ThemedText>
      </View>
      <ThemedText type="defaultSemiBold">
        {expense.amount.toFixed(2)} €
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    gap: 2,
  },
  sub: {
    fontSize: 12,
    opacity: 0.7,
  },
});
