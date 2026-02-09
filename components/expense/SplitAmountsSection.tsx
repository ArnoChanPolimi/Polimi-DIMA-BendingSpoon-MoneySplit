import { ThemedText } from "@/components/themed-text";
import { t } from "@/core/i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

interface Participant {
  uid: string;
  displayName: string;
}

interface SplitAmountsSectionProps {
  participants: Participant[];
  splitAmounts: Record<string, string>; // uid -> amount string
  onAmountChange: (uid: string, amount: string) => void;
  currentUserId?: string;
}

export function SplitAmountsSection({
  participants,
  splitAmounts,
  onAmountChange,
  currentUserId,
}: SplitAmountsSectionProps) {
  const borderColor = useThemeColor({}, "tabIconDefault");

  if (participants.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: 16 }}>
      <ThemedText type="subtitle">{t("splitAmounts")}</ThemedText>
      <ScrollView
        horizontal={false}
        style={styles.container}
        scrollEnabled={participants.length > 4}
      >
        {participants.map((participant) => (
          <View key={participant.uid} style={styles.row}>
            <View style={styles.nameContainer}>
              <View style={styles.avatar}>
                <ThemedText style={{ fontWeight: "bold", color: "#fff", fontSize: 12 }}>
                  {(participant.displayName || "U").charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={{ flex: 1, marginLeft: 8 }} numberOfLines={1}>
                {participant.uid === currentUserId
                  ? `${t("me")} (${participant.displayName})`
                  : participant.displayName}
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.amountInput,
                {
                  borderColor: borderColor,
                  backgroundColor: "#fff",
                },
              ]}
              placeholder={t("enterAmount")}
              keyboardType="decimal-pad"
              value={splitAmounts[participant.uid] || ""}
              onChangeText={(amount) => onAmountChange(participant.uid, amount)}
              placeholderTextColor="#9ca3af"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    maxHeight: 300,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 8,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 120,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  amountInput: {
    width: 80,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    fontSize: 14,
    textAlign: "right",
  },
});
