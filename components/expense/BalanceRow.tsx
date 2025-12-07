// components/expense/BalanceRow.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, View } from 'react-native';

export type Balance = {
  userName: string;
  netAmount: number; // 正数=应收，负数=应付
};

interface BalanceRowProps {
  balance: Balance;
}

export default function BalanceRow({ balance }: BalanceRowProps) {
  const isPositive = balance.netAmount >= 0;

  return (
    <ThemedView style={styles.row}>
      <ThemedText type="defaultSemiBold">{balance.userName}</ThemedText>
      <View style={styles.right}>
        <ThemedText
          style={{ color: isPositive ? '#16a34a' : '#dc2626' }}
        >
          {balance.netAmount.toFixed(2)} €
        </ThemedText>
        <ThemedText style={styles.tag}>
          {isPositive ? 'should receive' : 'should pay'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  tag: {
    fontSize: 12,
    opacity: 0.7,
  },
});
