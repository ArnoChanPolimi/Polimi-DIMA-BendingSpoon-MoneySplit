// app/group/[groupId]/add-expense.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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

// ====== 假数据：好友列表（以后可以换成真正的好友 / 通讯录）======
type Friend = {
  id: string;
  name: string;
};

const DEMO_FRIENDS: Friend[] = [
  { id: "me", name: "You" },
  { id: "bob", name: "Bob" },
  { id: "alice", name: "Alice" },
  { id: "tom", name: "Tom" },
  { id: "carol", name: "Carol" },
  { id: "emma", name: "Emma" },
  { id: "jack", name: "Jack" },
];

export default function GroupAddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");

  // 当前参与这次消费的人
  const [participantIds, setParticipantIds] = useState<string[]>([
    "me",
    "bob",
    "alice",
    "tom",
    "carol",
  ]);

  // 控制「添加参与者」弹窗
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");

  // ====== 切换某个好友是否参与 ======
  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ====== 点击 + 号：打开弹窗 ======
  const openAddPeople = () => {
    setShowAddPeople(true);
  };

  const closeAddPeople = () => {
    setShowAddPeople(false);
    setInviteSearch("");
  };

  // ====== 暂时只做 UI，真正保存逻辑以后写 ======
  const handleSave = () => {
    alert("TODO: implement save expense logic");
  };

  return (
    <AppScreen>
      <AppTopBar title="New expense" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. 名字 */}
          <ThemedText type="subtitle">1 · Give this expense a name</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner at Milano"
            value={title}
            onChangeText={setTitle}
          />

          {/* 2. 谁参与 · 有 + 号 */}
          <View style={{ marginTop: 20 }}>
            {/* <ThemedText type="subtitle">2 · Who is involved?</ThemedText> */}
            <ThemedText type="subtitle">1 · GIVE THIS EXPENSE A NAME FROM FILE XYZ</ThemedText>

            <ThemedText style={styles.helperText}>
              Later, this will come from your friends list / contacts. For now
              it is demo data.
            </ThemedText>

            <View style={styles.chipRow}>
              {/* 已在这次消费中的人 */}
              {DEMO_FRIENDS.filter((f) => participantIds.includes(f.id)).map(
                (friend) => (
                  <Pressable
                    key={friend.id}
                    onPress={() => toggleParticipant(friend.id)}
                    style={[
                      styles.chip,
                      styles.chipSelected, // 目前这些都是已选状态
                    ]}
                  >
                    <ThemedText style={styles.chipSelectedText}>
                      {friend.name}
                    </ThemedText>
                  </Pressable>
                )
              )}

              {/* 右侧这个就是你要的 + 号 */}
              <Pressable style={styles.addChip} onPress={openAddPeople}>
                <Ionicons name="add" size={20} color="#2563eb" />
              </Pressable>
            </View>
          </View>

          {/* 3. 总金额 */}
          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">3 · Total amount</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 120"
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>

          {/* 4. 备注 */}
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

      {/* ====== 添加参与者的弹窗（只是 UI）====== */}
      <Modal visible={showAddPeople} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold">
                Add people to this expense
              </ThemedText>
              <Pressable onPress={closeAddPeople}>
                <Ionicons name="close" size={20} />
              </Pressable>
            </View>

            <ThemedText style={styles.modalHelper}>
              Choose existing friends or search / invite new ones.
            </ThemedText>

            {/* 搜索 / 邀请框（这里只是摆 UI） */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, email, phone…"
              value={inviteSearch}
              onChangeText={setInviteSearch}
            />

            <ScrollView style={{ maxHeight: 260 }}>
              {DEMO_FRIENDS.map((friend) => {
                const selected = participantIds.includes(friend.id);
                return (
                  <Pressable
                    key={friend.id}
                    onPress={() => toggleParticipant(friend.id)}
                  >
                    <ThemedView style={styles.modalRow}>
                      <View style={styles.avatarCircle}>
                        <ThemedText>
                          {friend.name[0].toUpperCase()}
                        </ThemedText>
                      </View>
                      <ThemedText style={{ flex: 1 }}>
                        {friend.name}
                      </ThemedText>
                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#2563eb"
                        />
                      )}
                    </ThemedView>
                  </Pressable>
                );
              })}
            </ScrollView>

            <PrimaryButton
              label="Done"
              onPress={closeAddPeople}
            />
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
    paddingHorizontal: 16,
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
  // ===== 弹窗样式 =====
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
    gap: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalHelper: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  searchInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
});
