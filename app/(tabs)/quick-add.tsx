// app/(tabs)/quick-add.tsx
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { t } from "@/core/i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { addGroup } from "@/services/groupsStore";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";


let AsyncStorage: any = null;
try {
  // Optional dependency (works on mobile)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (_) {
  // Not installed -> only web save will work
}

type Currency = "EUR" | "USD" | "GBP" | "TRY" | "KZT";

type Expense = {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  note: string;
  participants: string[];
  createdAt: number;
};

const STORAGE_KEY = "moneysplit_expenses_v1";

const CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "TRY", "KZT"];

function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    // browsers sometimes don't show RN Alert reliably
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

async function loadExpenses(): Promise<Expense[]> {
  try {
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Expense[]) : [];
    }
    if (AsyncStorage) {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Expense[]) : [];
    }
    return [];
  } catch (e) {
    console.error("loadExpenses failed:", e);
    return [];
  }
}

async function saveExpense(expense: Expense): Promise<void> {
  try {
    const existing = await loadExpenses();
    const updated = [expense, ...existing];

    if (Platform.OS === "web") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return;
    }
    if (AsyncStorage) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return;
    }
  } catch (e) {
    console.error("saveExpense failed:", e);
  }
}

export default function QuickAddScreen() {
  const [groupName, setGroupName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Currency dropdown state
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Demo friends
  const demoFriends = useMemo(() => ["Bob", "Alice", "Tom", "Carol"], []);

  // Selected participants
  const [selected, setSelected] = useState<string[]>(["you"]);

  // Add custom participant
  const [newParticipant, setNewParticipant] = useState("");
  const [customPeople, setCustomPeople] = useState<string[]>([]);

  const togglePerson = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const selectedBg = "#2563eb";
  const selectedBorder = "#2563eb";

  const peopleText = selected.map((id) => (id === "you" ? t("you") : id)).join(", ");

  const addCustomParticipant = () => {
    const name = newParticipant.trim();
    if (!name) return;

    if (customPeople.includes(name) || selected.includes(name)) {
      setNewParticipant("");
      return;
    }

    setCustomPeople((p) => [...p, name]);
    setSelected((prev) => [...prev, name]);
    setNewParticipant("");
  };

const handleSave = async () => {
  if (!groupName.trim()) {
    notify("Missing name", "Please enter an expense name.");
    return;
  }

  const parsed = Number(String(amount).replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    notify("Invalid amount", "Please enter a valid amount (e.g. 12.50).");
    return;
  }

  if (selected.length === 0) {
    notify("No participants", "Please add at least one participant.");
    return;
  }

  // ✅ Create a "group" (because index.tsx displays groups)
  const newGroup = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: groupName.trim(),
    membersCount: selected.length,
    totalExpenses: parsed, currency,            // store number (not string)
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
    status: "ongoing" as const,
    types: ["other"] as const,          // keep simple for now
    members: selected.map(String),
    ownerId: "me",
    note: note.trim(),
    createdAt: Date.now(),
  };

  await addGroup(newGroup);

  const fakeInviteLink = `moneysplit://invite/${newGroup.id}`;

  notify(
    "Saved ✅",
    `Group: ${newGroup.name}\nTotal: ${newGroup.totalExpenses} ${currency}\nPeople: ${peopleText}\n\nInvite link (demo):\n${fakeInviteLink}`
  );

  setGroupName("");
  setAmount("");
  setNote("");
  setSelected(["you"]);
  setCustomPeople([]);
  setNewParticipant("");
  setCurrency("EUR");

router.replace("/"); 
};


  return (
    <AppScreen>
      <AppTopBar title={t("newExpense")} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1 */}
        <ThemedText type="subtitle">1 · Give this expense a name</ThemedText>
        <ThemedTextInput
          style={styles.input}
          placeholder={t("expenseNamePlaceholder")}
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Participants */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          2 · Add participants
        </ThemedText>
        <ThemedText style={styles.hint}>
          Select yourself and add names. Later we’ll invite real users.
        </ThemedText>

        <View style={styles.chipRow}>
          <Chip
            label={t("you")}
            selected={selected.includes("you")}
            onPress={() => togglePerson("you")}
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
              onPress={() => togglePerson(name)}
              borderColor={borderColor}
              cardColor={cardColor}
              selectedBg={selectedBg}
              selectedBorder={selectedBorder}
            />
          ))}

          {customPeople.map((name) => (
            <Chip
              key={name}
              label={name}
              selected={selected.includes(name)}
              onPress={() => togglePerson(name)}
              borderColor={borderColor}
              cardColor={cardColor}
              selectedBg={selectedBg}
              selectedBorder={selectedBorder}
            />
          ))}
        </View>

        {/* Add custom person */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <ThemedTextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Type a name (e.g. Sara)"
            value={newParticipant}
            onChangeText={setNewParticipant}
          />
          <PrimaryButton label="Add" onPress={addCustomParticipant} />
        </View>

        {/* Amount + Currency dropdown */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          3 · Amount
        </ThemedText>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <ThemedTextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={t("amountPlaceholder")}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Pressable
            onPress={() => setCurrencyOpen(true)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor,
              backgroundColor: cardColor,
              justifyContent: "center",
              minWidth: 86,
              alignItems: "center",
            }}
          >
            <ThemedText>{currency} ▾</ThemedText>
          </Pressable>
        </View>

        {/* Notes */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          Optional · Notes
        </ThemedText>
        <ThemedTextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder={t("notesPlaceholder")}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={{ height: 24 }} />

        <PrimaryButton label={t("saveDemo")} onPress={handleSave} />
      </ScrollView>

      {/* Currency dropdown modal */}
      <Modal transparent visible={currencyOpen} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCurrencyOpen(false)}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 10 }}>
              Select currency
            </ThemedText>

            {CURRENCIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  setCurrency(c);
                  setCurrencyOpen(false);
                }}
                style={styles.currencyRow}
              >
                <ThemedText style={{ flex: 1 }}>{c}</ThemedText>
                {c === currency ? <ThemedText>✓</ThemedText> : null}
              </Pressable>
            ))}
          </ThemedView>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  currencyRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
});
