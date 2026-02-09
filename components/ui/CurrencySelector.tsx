import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Currency, CURRENCY_NAMES, CURRENCY_SYMBOLS, SUPPORTED_CURRENCIES } from "@/services/exchangeRateApi";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
  showLabel?: boolean;
  label?: string;
}

export function CurrencySelector({
  selectedCurrency,
  onSelectCurrency,
  showLabel = true,
  label = "Record currency",
}: CurrencySelectorProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "tabIconDefault");

  return (
    <View>
      {showLabel && <ThemedText type="subtitle">{label}</ThemedText>}
      
      <Pressable
        onPress={() => setShowDropdown(!showDropdown)}
        style={[
          styles.selectorButton,
          {
            backgroundColor: backgroundColor,
            borderColor: borderColor,
          },
        ]}
      >
        <View style={styles.selectorContent}>
          <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
            {CURRENCY_SYMBOLS[selectedCurrency]} {selectedCurrency}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>
            {CURRENCY_NAMES[selectedCurrency]}
          </ThemedText>
        </View>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color={textColor}
        />
      </Pressable>

      {showDropdown && (
        <ThemedView style={styles.dropdownContainer}>
          <ScrollView style={styles.scrollView}>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <Pressable
                key={currency}
                onPress={() => {
                  onSelectCurrency(currency);
                  setShowDropdown(false);
                }}
                style={({ pressed }) => [
                  styles.currencyOption,
                  pressed && styles.currencyOptionPressed,
                  selectedCurrency === currency && styles.currencyOptionSelected,
                ]}
              >
                <View style={styles.currencyOptionContent}>
                  <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
                    {CURRENCY_SYMBOLS[currency]} {currency}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: "#9ca3af" }}>
                    {CURRENCY_NAMES[currency]}
                  </ThemedText>
                </View>
                {selectedCurrency === currency && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 4,
    maxHeight: 250,
    overflow: "hidden",
  },
  scrollView: {
    paddingVertical: 8,
  },
  currencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  currencyOptionPressed: {
    backgroundColor: "#f3f4f6",
  },
  currencyOptionSelected: {
    backgroundColor: "#eff6ff",
  },
  currencyOptionContent: {
    flex: 1,
  },
});
