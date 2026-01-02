// app/(tabs)/quick-add.tsx
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { t } from "@/core/i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function QuickAddScreen() {
  const [groupName, setGroupName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const demoFriends = useMemo(() => ["Bob", "Alice", "Tom", "Carol"], []);

  // ✅ 用稳定 id
  const [selected, setSelected] = useState<string[]>(["you"]);

  const toggleFriend = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  // ✅ 主题色只算一次（不在每个 Chip 里算）
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");

  // 选中态颜色（保持你原有设计）
  const selectedBg = "#2563eb";
  const selectedBorder = "#2563eb";

  const peopleText = selected
    .map((id) => (id === "you" ? t("you") : id))
    .join(", ");

  return (
    <AppScreen>
      <AppTopBar title={t("newExpense")} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1 */}
        <ThemedText type="subtitle">{t("step1Title")}</ThemedText>
        <ThemedTextInput
          style={styles.input}
          placeholder={t("expenseNamePlaceholder")}
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Step 2 */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          {t("step2Title")}
        </ThemedText>
        <ThemedText style={styles.hint}>{t("step2Hint")}</ThemedText>

        <View style={styles.chipRow}>
          <Chip
            label={t("you")}
            selected={selected.includes("you")}
            onPress={() => toggleFriend("you")}
            borderColor={borderColor}
            cardColor={cardColor}
            selectedBg={selectedBg}
            selectedBorder={selectedBorder}
          />

          {demoFriends.map((name) => (
            <Chip
              key={name}
              label={name}
              selected={selected.includes(name)}
              onPress={() => toggleFriend(name)}
              borderColor={borderColor}
              cardColor={cardColor}
              selectedBg={selectedBg}
              selectedBorder={selectedBorder}
            />
          ))}
        </View>

        {/* Step 3 */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          {t("step3Title")}
        </ThemedText>
        <ThemedTextInput
          style={styles.input}
          placeholder={t("amountPlaceholder")}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Notes */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          {t("notesOptionalTitle")}
        </ThemedText>
        <ThemedTextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder={t("notesPlaceholder")}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={{ height: 24 }} />

        <PrimaryButton
          label={t("saveDemo")}
          onPress={() => {
            Alert.alert(
              t("demoAlertTitle"),
              `${t("demoAlertName")}: ${groupName}\n${t("demoAlertAmount")}: ${amount}\n${t(
                "demoAlertPeople"
              )}: ${peopleText}`
            );
          }}
        />
      </ScrollView>
    </AppScreen>
  );
}

// 小组件：好友选择 chip（纯组件，不用 hook）
type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  borderColor: string;
  cardColor: string;
  selectedBg: string;
  selectedBorder: string;
};

function Chip({
  label,
  selected,
  onPress,
  borderColor,
  cardColor,
  selectedBg,
  selectedBorder,
}: ChipProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView
        style={[
          styles.chip,
          {
            borderColor: selected ? selectedBorder : borderColor,
            backgroundColor: selected ? selectedBg : cardColor,
          },
        ]}
      >
        <ThemedText style={selected ? styles.chipTextSelected : undefined}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },

  input: {},

  hint: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipTextSelected: {
    color: "white",
  },
});