// // app/add-expense.tsx
// import { Ionicons } from "@expo/vector-icons";
// import React, { useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   View,
// } from "react-native";

// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";
// import AppScreen from "@/components/ui/AppScreen";
// import AppTopBar from "@/components/ui/AppTopBar";
// import PrimaryButton from "@/components/ui/PrimaryButton";

// // ====== 假数据：好友列表（以后可以换成真正的好友 / 通讯录）======
// type Friend = {
//   id: string;
//   name: string;
// };

// const DEMO_FRIENDS: Friend[] = [
//   { id: "me", name: "You" },
//   { id: "bob", name: "Bob" },
//   { id: "alice", name: "Alice" },
//   { id: "tom", name: "Tom" },
//   { id: "carol", name: "Carol" },
//   { id: "emma", name: "Emma" },
//   { id: "jack", name: "Jack" },
// ];

// export default function AddExpenseScreen() {
//   const [title, setTitle] = useState("");
//   const [totalAmount, setTotalAmount] = useState("");
//   const [notes, setNotes] = useState("");

//   // 当前参与这次消费的人
//   const [participantIds, setParticipantIds] = useState<string[]>([
//     "me",
//     "bob",
//     "alice",
//     "tom",
//     "carol",
//   ]);

//   // 控制「添加参与者」弹窗
//   const [showAddPeople, setShowAddPeople] = useState(false);
//   const [inviteSearch, setInviteSearch] = useState("");

//   // ====== 切换某个好友是否参与 ======
//   const toggleParticipant = (id: string) => {
//     setParticipantIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   // ====== 点击 + 号：打开弹窗 ======
//   const openAddPeople = () => {
//     setShowAddPeople(true);
//   };

//   const closeAddPeople = () => {
//     setShowAddPeople(false);
//     setInviteSearch("");
//   };

//   // ====== 暂时只做 UI，真正保存逻辑以后写 ======
//   const handleSave = () => {
//     alert("TODO: implement save expense logic");
//   };

//   return (
//     <AppScreen>
//       <AppTopBar title="New expense" showBack />

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           contentContainerStyle={styles.container}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* 1. 名字 */}
//           <ThemedText type="subtitle">1 · Give this expense a name</ThemedText>
//           <TextInput
//             style={styles.input}
//             placeholder="e.g. Dinner at Milano"
//             value={title}
//             onChangeText={setTitle}
//           />

//           {/* 2. 谁参与 · 带 + 号 */}
//           <View style={{ marginTop: 20 }}>
//             {/* <ThemedText type="subtitle">2 · Who is involved?</ThemedText> */}
//             <ThemedText type="subtitle">THIS IS THE CORRECT SCREEN</ThemedText>
//             <ThemedText style={styles.helperText}>
//               Later, this will come from your friends list / contacts. For now
//               it is demo data.
//             </ThemedText>

//             <View style={styles.chipRow}>
//               {/* 已加入本次消费的参与者 */}
//               {DEMO_FRIENDS.filter((f) => participantIds.includes(f.id)).map(
//                 (friend) => (
//                   <Pressable
//                     key={friend.id}
//                     onPress={() => toggleParticipant(friend.id)}
//                     style={[styles.chip, styles.chipSelected]}
//                   >
//                     <ThemedText style={styles.chipSelectedText}>
//                       {friend.name}
//                     </ThemedText>
//                   </Pressable>
//                 )
//               )}

//               {/* 右侧这个就是你要的 + 号按钮 */}
//               <Pressable style={styles.addChip} onPress={openAddPeople}>
//                 <Ionicons name="add" size={20} color="#2563eb" />
//               </Pressable>
//             </View>
//           </View>

//           {/* 3. 总金额 */}
//           <View style={{ marginTop: 20 }}>
//             <ThemedText type="subtitle">3 · Total amount</ThemedText>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholder="e.g. 120"
//               value={totalAmount}
//               onChangeText={setTotalAmount}
//             />
//           </View>

//           {/* 4. 备注 */}
//           <View style={{ marginTop: 20 }}>
//             <ThemedText type="subtitle">Optional · Notes</ThemedText>
//             <TextInput
//               style={[styles.input, { height: 120, textAlignVertical: "top" }]}
//               multiline
//               placeholder="Anything you want to remember about this expense"
//               value={notes}
//               onChangeText={setNotes}
//             />
//           </View>

//           <View style={{ height: 24 }} />

//           <PrimaryButton label="Save expense" onPress={handleSave} />
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* ====== 添加参与者的弹窗（只是 UI）====== */}
//       <Modal visible={showAddPeople} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <ThemedView style={styles.modalCard}>
//             <View style={styles.modalHeader}>
//               <ThemedText type="defaultSemiBold">
//                 Add people to this expense
//               </ThemedText>
//               <Pressable onPress={closeAddPeople}>
//                 <Ionicons name="close" size={20} />
//               </Pressable>
//             </View>

//             <ThemedText style={styles.modalHelper}>
//               Choose existing friends or search / invite new ones.
//             </ThemedText>

//             {/* 搜索 / 邀请框（现在只做 UI，将来接通讯录 / 搜索接口） */}
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search name, email, phone…"
//               value={inviteSearch}
//               onChangeText={setInviteSearch}
//             />

//             <ScrollView style={{ maxHeight: 260 }}>
//               {DEMO_FRIENDS.map((friend) => {
//                 const selected = participantIds.includes(friend.id);
//                 return (
//                   <Pressable
//                     key={friend.id}
//                     onPress={() => toggleParticipant(friend.id)}
//                   >
//                     <ThemedView style={styles.modalRow}>
//                       <View style={styles.avatarCircle}>
//                         <ThemedText>
//                           {friend.name[0].toUpperCase()}
//                         </ThemedText>
//                       </View>
//                       <ThemedText style={{ flex: 1 }}>
//                         {friend.name}
//                       </ThemedText>
//                       {selected && (
//                         <Ionicons
//                           name="checkmark-circle"
//                           size={20}
//                           color="#2563eb"
//                         />
//                       )}
//                     </ThemedView>
//                   </Pressable>
//                 );
//               })}
//             </ScrollView>

//             <PrimaryButton label="Done" onPress={closeAddPeople} />
//           </ThemedView>
//         </View>
//       </Modal>
//     </AppScreen>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 16,
//     paddingBottom: 32,
//     gap: 12,
//   },
//   input: {
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     marginTop: 8,
//     fontSize: 14,
//     backgroundColor: "white",
//   },
//   helperText: {
//     fontSize: 12,
//     opacity: 0.7,
//     marginTop: 4,
//     marginBottom: 8,
//   },
//   chipRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginTop: 4,
//   },
//   chip: {
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   chipSelected: {
//     backgroundColor: "#2563eb",
//     borderColor: "#2563eb",
//   },
//   chipSelectedText: {
//     color: "white",
//   },
//   addChip: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   // ===== 弹窗样式 =====
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "flex-end",
//   },
//   modalCard: {
//     backgroundColor: "white",
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 16,
//     gap: 8,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   modalHelper: {
//     fontSize: 12,
//     opacity: 0.7,
//     marginBottom: 8,
//   },
//   searchInput: {
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     marginBottom: 8,
//     fontSize: 14,
//   },
//   modalRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f3f4f6",
//     gap: 10,
//   },
//   avatarCircle: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#e5e7eb",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });


// app/add-expense.tsx
// 从app/group/[groupId]/add-expense.tsx 迁移到 // app/add-expense.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
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

import { ParticipantSection } from "@/components/expense/ParticipantSection";

type FriendRecord = {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  addedAt: number;
};

export default function AddExpenseScreen() {
  // const { groupId } = useLocalSearchParams();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [friends, setFriends] = useState<FriendRecord[]>([]);
  // 应该改为（默认只选你自己）：
  const [participantIds, setParticipantIds] = useState<string[]>(
    auth.currentUser?.uid ? [auth.currentUser.uid] : []
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
        
        const fetchedFriends = snapshot.docs.map(d => {
          const data = d.data();
          // 强制 trim() 掉可能存在的空格，并确保 uid 一定存在
          const actualUid = (data.uid || d.id).trim(); 
          return {
            uid: actualUid,
            displayName: data.displayName || "Unknown",
            username: data.username || "user",
            avatar: "", // 彻底不管它
            addedAt: Number(data.addedAt) || Date.now()
          } as FriendRecord;
        });

        // Logic: Always include the current user to satisfy the participantIds filter
        const me: FriendRecord = {
          uid: myUid,
          displayName: "Me",
          username: "me",
          avatar: "https://ui-avatars.com/api/?name=Me",
          addedAt: Date.now()
        };

        setFriends([me, ...fetchedFriends]);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    loadFriendsFromDb();
  }, []);

  const toggleParticipant = (friendUid: string) => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    // 统一对传入的 ID 进行清洗
    const cleanFriendUid = friendUid.trim();
    const cleanMyUid = myUid.trim();

    setParticipantIds((prev) => {
      // 检查时也清洗数组内部的 ID
      const isExist = prev.map(id => id.trim()).includes(cleanFriendUid);

      if (isExist) {
        if (cleanFriendUid === cleanMyUid) return prev; 
        return prev.filter((id) => id.trim() !== cleanFriendUid);
      } else {
        return [...prev, cleanFriendUid];
      }
    });
  };

  const handleSave = async () => {
    const amountNum = parseFloat(totalAmount);
    
    // 逻辑检查：确保数值有效
    if (!title || isNaN(amountNum)) {
      alert("Please enter a valid title and amount");
      return;
    }

    const myUid = auth.currentUser?.uid;
    if (!myUid) {
      alert("Please log in first");
      return;
    }

    try {
      // 1. 先定好存哪儿
      const collectionPath = groupId 
        ? collection(db, "groups", groupId as string, "expenses") // 走群组
        : collection(db, "users", myUid, "personal_expenses");    // 走个人

      // 2. 直接存进去
      await addDoc(collectionPath, {
        title,
        amount: amountNum,
        payerId: myUid,
        participants: participantIds, // 就算不选别人，这里面也只有你一个人的 ID
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

          <ParticipantSection 
            // 这里的 includes 也要加 trim()，否则主页面圆圈还是出不来！
            selectedFriends={friends.filter((f) => 
              participantIds.map(id => id.trim()).includes(f.uid.trim())
            )} 
            participantIds={participantIds}
            onToggle={toggleParticipant}
            onAddPress={() => setShowAddPeople(true)}
          />

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
              {/* 1. 过滤掉自己后的好友列表逻辑 */}
              {friends.filter(f => f.uid !== auth.currentUser?.uid).length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ThemedText style={{ color: '#9ca3af' }}>You don't have any friends</ThemedText>
                </View>
              ) : (
                friends.map((friend) => (
                  <Pressable key={friend.uid} onPress={() => toggleParticipant(friend.uid)}>
                    <ThemedView style={styles.modalRow}>
                      
                      {/* 2. 核心改动：不再使用 Image 标签，直接显示首字母 */}
                      <View style={[styles.avatarCircle, { backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }]}>
                        <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                          {(friend.displayName || "U").charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>

                      <ThemedText style={{ flex: 1 }}>{friend.displayName}</ThemedText>

                      {/* 3. 勾选逻辑 */}
                      {participantIds.map(id => id.trim()).includes(friend.uid.trim()) && (
                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                      )}
                    </ThemedView>
                  </Pressable>
                ))
              )}
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 8 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 10 },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#e5e7eb" },
});