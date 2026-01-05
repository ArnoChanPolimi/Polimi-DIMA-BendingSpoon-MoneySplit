// app/add-expense.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { createExpense } from "@/services/expenseApi";
import { auth } from "@/services/firebase";


const ME = { id: "me", name: "Me" };

const CURRENCIES = ["EUR", "USD", "GBP", "TRY"] as const;
type Currency = (typeof CURRENCIES)[number];

type Participant = {
  id: string;       // "me" or "typed:laura" etc.
  label: string;    // shown on chip
  isRealUser?: boolean; // future: true if it’s an actual signed user
};

export default function AddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // numeric string
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [notes, setNotes] = useState("");

  // participants: always include ME
  const [participants, setParticipants] = useState<Participant[]>([
    { id: ME.id, label: ME.name, isRealUser: true },
  ]);

  // modal for adding participants
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [participantName, setParticipantName] = useState("");

  const participantIds = useMemo(() => new Set(participants.map(p => p.id)), [participants]);

  const removeParticipant = (id: string) => {
    // don’t remove yourself
    if (id === ME.id) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const addTypedParticipant = () => {
    const name = participantName.trim();
    if (!name) return;

    const id = `typed:${name.toLowerCase()}`;
    if (participantIds.has(id)) {
      Alert.alert("Already added", "This participant is already in the list.");
      return;
    }

    setParticipants(prev => [...prev, { id, label: name }]);
    setParticipantName("");
  };

  const openAddPeople = () => setShowAddPeople(true);
  const closeAddPeople = () => {
    setShowAddPeople(false);
    setParticipantName("");
  };

  // TEMP: generate an invite link (real version will use Firestore expenseId + inviteCode)
  const buildInviteLink = (expenseId: string, inviteCode: string) => {

    return Linking.createURL("invite", { queryParams: { expenseId, code: inviteCode } });
  };

const handleSave = async () => {
  try {
    if (!title.trim()) {
      Alert.alert("Missing name");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Invalid amount");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in");

    const { expenseId, inviteCode } = await createExpense({
      title: title.trim(),
      amount: Number(amount),
      currency,
      participantIds: [uid], // start with creator only
    });

    const inviteLink = Linking.createURL("invite", {
      queryParams: { expenseId, code: inviteCode },
    });

    Alert.alert(
      "Expense created",
      `Share this link:\n${inviteLink}`
    );
  } catch (e: any) {
    Alert.alert("Error", e.message ?? "Failed to save expense");
  }
};


  return (
    <AppScreen>
      <AppTopBar title="New expense" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* 1) Name */}
          <ThemedText type="subtitle">1 · Give this expense a name</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner at Milano"
            value={title}
            onChangeText={setTitle}
          />

          {/* 2) Amount + Currency (replaces Total Amount) */}
          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">2 · Amount</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 120"
              value={amount}
              onChangeText={setAmount}
            />

            <ThemedText style={[styles.helperText, { marginTop: 10 }]}>
              Currency
            </ThemedText>

            <View style={styles.chipRow}>
              {CURRENCIES.map((c) => {
                const selected = currency === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCurrency(c)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <ThemedText style={selected ? styles.chipSelectedText : undefined}>
                      {c}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3) Participants */}
          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">3 · Add participants</ThemedText>
            <ThemedText style={styles.helperText}>
              Select yourself and add others. Later we’ll connect this to real users + invite links.
            </ThemedText>

            <View style={styles.chipRow}>
              {participants.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => removeParticipant(p.id)}
                  style={[styles.chip, styles.chipSelected]}
                >
                  <ThemedText style={styles.chipSelectedText}>
                    {p.label}{p.id === ME.id ? " (you)" : " ✕"}
                  </ThemedText>
                </Pressable>
              ))}

              <Pressable style={styles.addChip} onPress={openAddPeople}>
                <Ionicons name="add" size={20} color="#2563eb" />
              </Pressable>
            </View>
          </View>

          {/* 4) Notes */}
          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">Optional · Notes</ThemedText>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              multiline
              placeholder="Anything you want to remember about this expense"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <View style={{ height: 24 }} />
          <PrimaryButton label="Save expense" onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add participants modal */}
      <Modal visible={showAddPeople} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold">Add participants</ThemedText>
              <Pressable onPress={closeAddPeople}>
                <Ionicons name="close" size={20} />
              </Pressable>
            </View>

            <ThemedText style={styles.modalHelper}>
              Type a name and press Add. (Next step: invite real users by email.)
            </ThemedText>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={[styles.searchInput, { flex: 1 }]}
                placeholder="e.g. Alice"
                value={participantName}
                onChangeText={setParticipantName}
              />
              <Pressable style={styles.addButton} onPress={addTypedParticipant}>
                <ThemedText style={{ color: "white" }}>Add</ThemedText>
              </Pressable>
            </View>

            <PrimaryButton label="Done" onPress={closeAddPeople} />
          </ThemedView>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
    fontSize: 14,
    backgroundColor: "white",
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipSelectedText: {
    color: "white",
  },
  addChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalHelper: {
    fontSize: 12,
    opacity: 0.7,
  },
  searchInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
