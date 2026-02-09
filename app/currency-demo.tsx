// app/currency-demo.tsx
/**
 * 货币转换演示页面
 * 展示如何在实际应用中使用 CurrencyContext
 */

import ExpenseCardWithCurrency from "@/components/expense/ExpenseCardWithCurrency";
import { ThemedText } from "@/components/themed-text";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import { useCurrency } from "@/core/currency/CurrencyContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function CurrencyDemoScreen() {
  const {
    defaultCurrency,
    setDefaultCurrency,
    convertAmount,
    getRate,
    formatAmount,
    supportedCurrencies,
    currencyNames,
    hydrated,
  } = useCurrency();

  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  // 演示数据
  const demoExpenses = [
    {
      id: "1",
      description: "飞机票",
      amount: 500,
      currency: "USD" as const,
      paidBy: "Alice",
      date: "2025-02-09",
    },
    {
      id: "2",
      description: "酒店",
      amount: 150,
      currency: "EUR" as const,
      paidBy: "Bob",
      date: "2025-02-09",
    },
    {
      id: "3",
      description: "晚餐",
      amount: 800,
      currency: "CNY" as const,
      paidBy: "Charlie",
      date: "2025-02-10",
    },
    {
      id: "4",
      description: "景点门票",
      amount: 100,
      currency: "GBP" as const,
      paidBy: "Alice",
      date: "2025-02-10",
    },
  ];

  // 获取汇率
  const fetchRate = async () => {
    setLoading(true);
    try {
      const fromCurrency = "USD";
      const toCurrency = defaultCurrency;
      const r = await getRate(
        fromCurrency as any,
        toCurrency
      );
      setRate(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hydrated) {
      fetchRate();
    }
  }, [defaultCurrency, hydrated]);

  // 刷新汇率
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRate();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  if (!hydrated) {
    return (
      <AppScreen>
        <AppTopBar title="货币演示" />
        <View style={{ padding: 16, alignItems: "center", justifyContent: "center", flex: 1 }}>
          <ThemedText>初始化中...</ThemedText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppTopBar 
        title="💱 货币转换演示"
        showRefresh={true}
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* 当前货币选择 */}
        <View style={{ padding: 16, gap: 12 }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
            选择默认货币
          </ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {supportedCurrencies.map((currency) => (
              <Pressable
                key={currency}
                onPress={() => setDefaultCurrency(currency)}
                style={[
                  styles.currencyButton,
                  {
                    backgroundColor:
                      defaultCurrency === currency ? "#0a7ea4" : cardColor,
                    borderColor,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color: defaultCurrency === currency ? "#fff" : textColor,
                    fontWeight: defaultCurrency === currency ? "bold" : "normal",
                  }}
                >
                  {currency}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 汇率展示 */}
        <View style={[styles.infoBox, { borderColor, backgroundColor: cardColor }]}>
          <ThemedText type="defaultSemiBold">📊 实时汇率</ThemedText>
          <ThemedText style={{ marginTop: 8 }}>
            1 USD = {loading ? "加载中..." : rate?.toFixed(4) ?? "获取失败"} {defaultCurrency}
          </ThemedText>
          <Pressable
            onPress={fetchRate}
            style={[styles.refreshButton, { borderColor }]}
          >
            <ThemedText style={{ color: "#0a7ea4" }}>刷新汇率</ThemedText>
          </Pressable>
        </View>

        {/* 快速转换演示 */}
        <View style={[styles.infoBox, { borderColor, backgroundColor: cardColor }]}>
          <ThemedText type="defaultSemiBold">🔄 快速转换示例</ThemedText>
          <View style={{ marginTop: 12, gap: 8 }}>
            <View>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                $100 USD →
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 16, color: "#0a7ea4" }}>
                {rate ? formatAmount(100 * rate, defaultCurrency) : "N/A"}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                €50 EUR →
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 16, color: "#0a7ea4" }}>
                {rate ? formatAmount(50 * (rate ?? 1) * 1.1, defaultCurrency) : "N/A"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 支出列表 */}
        <View style={{ paddingHorizontal: 16 }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 12 }}>
            📋 支出清单 (已转换到 {defaultCurrency})
          </ThemedText>
          {demoExpenses.map((expense) => (
            <ExpenseCardWithCurrency key={expense.id} expense={expense} />
          ))}
        </View>

        {/* 总结 */}
        <View style={[styles.infoBox, { borderColor, backgroundColor: cardColor }]}>
          <ThemedText type="defaultSemiBold">✨ 功能说明</ThemedText>
          <View style={{ marginTop: 8, gap: 6 }}>
            <ThemedText style={{ fontSize: 13 }}>
              • 所有支出金额已自动转换到您选择的货币
            </ThemedText>
            <ThemedText style={{ fontSize: 13 }}>
              • 点击上方按钮切换默认货币
            </ThemedText>
            <ThemedText style={{ fontSize: 13 }}>
              • 使用您的 API Key 配置后，汇率实时更新
            </ThemedText>
            <ThemedText style={{ fontSize: 13 }}>
              • 转换结果自动保存，下次启动时恢复
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 60,
    alignItems: "center",
  },
  infoBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  refreshButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
});
