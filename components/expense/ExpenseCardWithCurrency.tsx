// components/expense/ExpenseCardWithCurrency.tsx
/**
 * 支出卡片组件 - 集成货币转换
 * 展示支出金额，并自动转换到用户选择的默认货币
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCurrency } from "@/core/currency/CurrencyContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR" | "AUD" | "CAD";
  paidBy: string;
  date: string;
}

interface Props {
  expense: Expense;
}

export default function ExpenseCardWithCurrency({ expense }: Props) {
  const { convertAmount, formatAmount, defaultCurrency, hydrated } = useCurrency();
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const cardBackgroundColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  // 当支出或用户的默认货币改变时，转换金额
  useEffect(() => {
    if (!hydrated) return;

    const convert = async () => {
      setIsLoading(true);
      try {
        if (expense.currency === defaultCurrency) {
          // 同货币，直接使用
          setConvertedAmount(expense.amount);
        } else {
          // 调用转换 API
          const converted = await convertAmount(
            expense.amount,
            expense.currency,
            defaultCurrency
          );
          setConvertedAmount(converted);
        }
      } catch (error) {
        console.error("货币转换失败:", error);
        // 转换失败，显示原始金额
        setConvertedAmount(expense.amount);
      } finally {
        setIsLoading(false);
      }
    };

    convert();
  }, [expense, defaultCurrency, hydrated, convertAmount]);

  if (!hydrated) {
    return (
      <ThemedView style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
        <ThemedText>加载中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
      {/* 标题行：描述 + 金额 */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
            {expense.description}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textColor, opacity: 0.6 }]}>
            由 {expense.paidBy} 支付
          </ThemedText>
        </View>

        {/* 金额显示区域 */}
        <View style={styles.amountBox}>
          {/* 原始金额（如果与用户默认货币不同则显示） */}
          {expense.currency !== defaultCurrency && (
            <ThemedText style={[styles.originalAmount, { color: textColor, opacity: 0.5 }]}>
              {expense.currency} {expense.amount.toFixed(2)}
            </ThemedText>
          )}

          {/* 转换后的金额（或原始金额如果相同） */}
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.convertedAmount,
              { color: "#0a7ea4" },
              isLoading && { opacity: 0.5 }
            ]}
          >
            {isLoading ? "转换中..." : convertedAmount !== null ? formatAmount(convertedAmount, defaultCurrency) : "N/A"}
          </ThemedText>
        </View>
      </View>

      {/* 日期 */}
      <ThemedText style={[styles.date, { color: textColor, opacity: 0.4 }]}>
        {new Date(expense.date).toLocaleDateString()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 6,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  amountBox: {
    alignItems: "flex-end",
    gap: 4,
  },
  originalAmount: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  convertedAmount: {
    fontSize: 18,
  },
  date: {
    fontSize: 12,
  },
});
