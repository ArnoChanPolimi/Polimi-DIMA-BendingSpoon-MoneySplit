// app/group/[groupId]/add-expense.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
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

import { auth, db } from "@/services/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";

// 使用 ES 模块导入 JSON，避免 CommonJS 解析错误
import defaultFriends from '../../../assets/data/friends.json';

type FriendRecord = {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  addedAt: number;
};

export default function GroupAddExpenseScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [friends, setFriends] = useState<FriendRecord[]>(defaultFriends as FriendRecord[]);
  const [participantIds, setParticipantIds] = useState<string[]>(
    (defaultFriends as FriendRecord[]).map(f => f.username)
  );

  const [showAddPeople, setShowAddPeople] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");

  useEffect(() => {
    const loadFriendsFromDb = async () => {
      const myUid = auth.currentUser?.uid;
      if (!myUid) return;

      try {
        const friendsRef = collection(db, "users", myUid, "friends");
        const snapshot = await getDocs(friendsRef);
        
        if (!snapshot.empty) {
          const fetchedFriends = snapshot.docs.map(d => d.data() as FriendRecord);
          setFriends(fetchedFriends);
          // 仅在初始状态时同步
          if (participantIds.length === 0) {
            setParticipantIds(fetchedFriends.map(f => f.username));
          }
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    loadFriendsFromDb();
  }, []);

  const toggleParticipant = (username: string) => {
    setParticipantIds((prev) =>
      prev.includes(username) 
        ? prev.filter((x) => x !== username) 
        : [...prev, username]
    );
  };

  const handleSave = async () => {
    const amountNum = parseFloat(totalAmount);
    
    // 逻辑检查：确保数值有效
    if (!title || isNaN(amountNum)) {
      alert("Please enter a valid title and amount");
      return;
    }

    const myUid = auth.currentUser?.uid;
    if (!myUid || !groupId) return;

    try {
      await addDoc(collection(db, "groups", groupId as string, "expenses"), {
        title,
        amount: amountNum,
        payerId: myUid,
        participants: participantIds, 
        notes: notes,
        createdAt: Date.now(),
      });

      alert("Expense saved!");
      router.back();
    } catch (error) {
      console.error("Save failed:", error);
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
          <ThemedText type="subtitle">1 · Expense Name</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner"
            value={title}
            onChangeText={setTitle}
          />

          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">2 · Who is involved?</ThemedText>
            <View style={styles.chipRow}>
              {friends
                .filter((f) => participantIds.includes(f.username))
                .map((friend) => (
                  <Pressable
                    key={friend.username}
                    onPress={() => toggleParticipant(friend.username)}
                    style={[styles.chip, styles.chipSelected]}
                  >
                    <ThemedText style={styles.chipSelectedText}>{friend.displayName}</ThemedText>
                  </Pressable>
                ))}
              <Pressable style={styles.addChip} onPress={() => setShowAddPeople(true)}>
                <Ionicons name="add" size={20} color="#2563eb" />
              </Pressable>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">3 · Amount</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">Optional · Notes</ThemedText>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <View style={{ height: 24 }} />
          <PrimaryButton label="Save expense" onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showAddPeople} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold">Add people</ThemedText>
              <Pressable onPress={() => { setShowAddPeople(false); setInviteSearch(""); }}>
                <Ionicons name="close" size={20} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {friends.map((friend) => (
                <Pressable key={friend.username} onPress={() => toggleParticipant(friend.username)}>
                  <ThemedView style={styles.modalRow}>
                    <Image source={{ uri: friend.avatar }} style={styles.avatarCircle} />
                    <ThemedText style={{ flex: 1 }}>{friend.displayName}</ThemedText>
                    {participantIds.includes(friend.username) && (
                      <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                    )}
                  </ThemedView>
                </Pressable>
              ))}
            </ScrollView>
            <PrimaryButton label="Done" onPress={() => setShowAddPeople(false)} />
          </ThemedView>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  input: { borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", padding: 10, marginTop: 8, backgroundColor: "white" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 8 },
  chipSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipSelectedText: { color: "white" },
  addChip: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 8 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 10 },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#e5e7eb" },
});