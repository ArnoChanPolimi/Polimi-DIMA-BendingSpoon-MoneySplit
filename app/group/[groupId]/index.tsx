// // app\group\[groupId]\index.tsx
// import { auth, db, uploadImageAndGetUrl } from '@/services/firebase';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useLocalSearchParams } from 'expo-router';
// import { arrayUnion, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
// import { useEffect, useState } from 'react';
// import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// // 1. 修改导入
// import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import AppScreen from '@/components/ui/AppScreen';
// import AppTopBar from '@/components/ui/AppTopBar';
// import * as ImagePicker from 'expo-image-picker';


// type GroupDetail = {
//   id: string;
//   name: string;
//   startDate: string;
//   totalExpenses: number;
//   status: 'ongoing' | 'finished';
//   involvedFriends?: { uid: string; displayName: string }[]; // 因为在 QuickAdd 存的是这个字段
//   receiptUrls?: string[];
//   ownerId: string;       // 补上这个
//   payerIds?: string[];   // 补上这个
//   participantIds?: string[]; // 补上这个
// };

// type ExpenseItem = {
//   id: string;
//   title: string;
//   amount: number;
//   createdAt: number;
//   participants: string[];
// };

// export default function GroupDetailScreen() {
//   const { groupId } = useLocalSearchParams<{ groupId: string }>();
  
//   const [group, setGroup] = useState<GroupDetail | null>(null);
//   const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [allFriends, setAllFriends] = useState<{ uid: string; displayName: string }[]>([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [activeRole, setActiveRole] = useState<'payer' | 'participant'>('participant');

//   // 1. 在组件内定义更新逻辑
//   const handleAddMember = async (friend: { uid: string, displayName: string }, role: 'payer' | 'participant') => {
//     if (!groupId) return;
//     try {
//       const groupRef = doc(db, "groups", groupId);
      
//       // 构建更新数据
//       const updateData: any = {
//         involvedFriends: arrayUnion(friend), // 所有人都要进 involvedFriends
//       };

//       // 根据角色决定进哪个 ID 数组
//       if (role === 'payer') {
//         updateData.payerIds = arrayUnion(friend.uid);
//       } else {
//         updateData.participantIds = arrayUnion(friend.uid);
//       }

//       await updateDoc(groupRef, updateData);
//     } catch (error) {
//       console.error("Add member error:", error);
//       Alert.alert("Error", "Failed to add member.");
//     }
//   };
//   // 追加上传小票逻辑
//   const handleAddReceipt = async () => {
//     // 1. 权限检查 (针对 iOS/Android)
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert("Permission Denied", "We need camera roll permissions to upload receipts.");
//       return;
//     }

// [FIX] Remove stray ternary JSX outside of a return block (lines 61-65)
// The following code is invalid outside of a JSX return:
// <ThemedText style={{ opacity: 0.5, textAlign: 'center', padding: 20 }}>No records found.</ThemedText>
// ) : (
//   expenses.map((item) => (
//     <View key={item.id} style={styles.expenseRow}>
//       <View style={{ flex: 1 }}>
//         <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
//         <ThemedText style={styles.participantsText}>Involved: {item.participants?.join(', ') || 'Everyone'}</ThemedText>
//       </View>
//       <ThemedText type="defaultSemiBold" style={styles.amountText}>-{item.amount.toFixed(2)} €</ThemedText>
//     </View>
//   ))
// )

// This logic should only appear inside a JSX return, which is already present in the Expense History section below.

//     try {
//       // 2. 选择图片
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         quality: 0.5,
//       });

//       if (!result.canceled && result.assets && groupId) {
//         setLoading(true); // 开启全局 Loading 或局部的上传状态
//         const newUri = result.assets[0].uri;
        
//         // 3. 上传到 Firebase Storage
//         // 这里沿用你的 uniqueBillId 逻辑，直接用 groupId 作为文件夹名
//         const uploadedUrl = await uploadImageAndGetUrl(newUri, groupId);

//         // 4. 追加到 Firestore 的 receiptUrls 数组中
//         const groupRef = doc(db, "groups", groupId);
//         await updateDoc(groupRef, {
//           receiptUrls: arrayUnion(uploadedUrl)
//         });

//         setLoading(false);
//         Alert.alert("Success", "Receipt added successfully!");
//       }
//     } catch (error) {
//       setLoading(false);
//       console.error("Upload failed:", error);
//       Alert.alert("Error", "Failed to upload receipt.");
//     }
//   };

//   useEffect(() => {
//     if (!groupId) {
//       setLoading(false);
//       return;
//     }

//     // 1. 静态数据检查
//     const staticGroup = MOCK_GROUPS_DATA[groupId];
//     if (staticGroup) {
//       setGroup(staticGroup);
//       setLoading(false);
//       return;
//     }

//     // 2. 核心逻辑：监听 Auth 和 Data
//     const unsubAuth = auth.onAuthStateChanged((user) => {
//       if (!user) {
//         console.log("No user found, resetting state");
//         // 必须加上这几行，否则切换账号后，旧账号的数据还会挂在屏幕上
//         setGroup(null);
//         setExpenses([]);
//         setAllFriends([]);
//         setLoading(false); 
//         return;
//       }

//       // 只有确定有 user 了，才开启 Firestore 监听
//       const unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
//         if (snap.exists()) {
//           const data = snap.data();
//           setGroup({ id: snap.id, ...data } as GroupDetail);
//         }
//         setLoading(false); // ✅ 成功获取数据后关闭
//       }, (err) => {
//         console.error(err);
//         setLoading(false); // ✅ 报错也要关闭
//       });

//       const unsubExpenses = onSnapshot(
//         query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc")),
//         (snap) => {
//           setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[]);
//         }
//       );

//       const friendsRef = collection(db, "users", user.uid, "friends");
//       const unsubFriends = onSnapshot(query(friendsRef, orderBy("displayName", "asc")), (snap) => {
//         setAllFriends(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as any);
//       });

//       // 清理函数嵌套
//       return () => {
//         unsubGroup();
//         unsubExpenses();
//         unsubFriends();
//       };
//     });

//     return () => unsubAuth();
//   }, [groupId]);

//   if (loading) return <AppScreen><AppTopBar title="Loading..." showBack /><ThemedText style={{padding:20}}>Fetching...</ThemedText></AppScreen>;
//   if (!group) return <AppScreen><AppTopBar title="Error" showBack /><ThemedText style={{padding:20}}>Group Not Found</ThemedText></AppScreen>;

//   return (
//     <AppScreen>
//       <AppTopBar
//         title={group.name}
//         showBack
//         rightIconName="chatbubbles-outline"
//         onRightIconPress={() => router.push(`/group/${group.id}/chat`)}
//       />

//       <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
//         {/* 顶部蓝色概览卡片 */}
//         <ThemedView style={styles.headerCard}>
//           {/* 【修改点 3】增加显眼的唯一 ID 展示 */}
//           <View style={styles.idBadge}>
//             <ThemedText style={styles.idBadgeText}>BILL NO: {group.id}</ThemedText>
//           </View>

//           <ThemedText style={styles.dateText}>Created on {group.startDate}</ThemedText>
//           <ThemedText type="title" style={styles.totalAmount}>
//             {group.totalExpenses.toFixed(2)} €
//           </ThemedText>
//           <ThemedText style={styles.totalLabel}>Total Group Spending</ThemedText>
//         </ThemedView>

//         <ThemedText type="subtitle" style={styles.sectionTitle}>Expense History</ThemedText>
//         <ThemedView style={styles.listCard}>
//           {expenses.length === 0 ? (
//             <ThemedText style={{ opacity: 0.5, textAlign: 'center', padding: 20 }}>No records found.</ThemedText>
//           ) : (
//             expenses.map((item) => (
//               <View key={item.id} style={styles.expenseRow}>
//                 <View style={{ flex: 1 }}>
//                   <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
//                   <ThemedText style={styles.participantsText}>Involved: {item.participants?.join(', ') || 'Everyone'}</ThemedText>
//                 </View>
//                 <ThemedText type="defaultSemiBold" style={styles.amountText}>-{item.amount.toFixed(2)} €</ThemedText>
//               </View>
//             ))
//           )}
//         </ThemedView>

//         <ThemedText type="subtitle" style={styles.sectionTitle}>Group Members</ThemedText>
//         <View style={styles.roleContainer}>
//           {/* 1. Owner 区域 */}
//           <ThemedText style={styles.roleLabel}>👑 Owner (Organizer)</ThemedText>
//           <View style={styles.memberRow}>
//             {group.involvedFriends?.filter(f => {
//               // 确保 f 存在且 uid 匹配
//               return f && f.uid === group.ownerId;
//             }).map(f => (
//               <View key={`owner-${f.uid}`} style={[styles.memberChip, styles.ownerChip]}>
//                 <Ionicons name="ribbon" size={12} color="#f59e0b" style={{marginRight: 4}} />
//                 <ThemedText style={styles.ownerText}>
//                   {f.uid === auth.currentUser?.uid ? "Me (Owner)" : f.displayName}
//                 </ThemedText>
//               </View>
//             ))}
//           </View>

//           {/* 2. Payers 区域 */}
//           <ThemedText style={styles.roleLabel}>💳 Paid By</ThemedText>
//           <View style={styles.memberRow}>
//             {group.involvedFriends?.filter(f => group.payerIds?.includes(f.uid)).map(f => (
//               <View key={`payer-${f.uid}`} style={[styles.memberChip, styles.payerChip]}>
//                 <Ionicons name="card" size={12} color="#10b981" style={{marginRight: 4}} />
//                 <ThemedText style={styles.payerText}>{f.displayName}</ThemedText>
//               </View>
//             ))}

//             {/* 💡 补上这个按键 */}
//             <Pressable 
//               style={styles.addMemberChip} 
//               onPress={() => {
//                 setActiveRole('payer'); // 关键：标记我是要加付款人
//                 setIsModalVisible(true);
//               }}
//             >
//               <Ionicons name="add" size={14} color="#6b7280" />
//               <ThemedText style={styles.addMemberText}>Add</ThemedText>
//             </Pressable>
//           </View>
//           {/* 3. Participants 区域 */}
//           <ThemedText style={styles.roleLabel}>👥 Splitting With</ThemedText>
//           <View style={styles.memberRow}>
//             {group.involvedFriends?.filter(f => group.participantIds?.includes(f.uid)).map(f => (
//               <View key={`part-${f.uid}`} style={styles.memberChip}>
//                 <ThemedText style={styles.chipText}>{f.displayName}</ThemedText>
//               </View>
//             ))}
            
//             {/* 3. Participants 区域的按钮 */}
//             <Pressable 
//               style={styles.addMemberChip} 
//               onPress={() => {
//                 setActiveRole('participant'); // 关键：标记我是要加分摊者
//                 setIsModalVisible(true);
//               }}
//             >
//               <Ionicons name="add" size={14} color="#6b7280" />
//               <ThemedText style={styles.addMemberText}>Add</ThemedText>
//             </Pressable>
//           </View>
//         </View>
//         {/* --- 新增：小票展示区域 --- */}

//       </ScrollView>
//       {/* 选择好友的弹窗 */}
//       <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
//         <AppScreen>
//           <AppTopBar title="Add Members" showBack onBackPress={() => setIsModalVisible(false)} />
//           <ScrollView style={{ padding: 16 }}>
//             {allFriends.map((friend) => (
//               <Pressable 
//                 key={friend.uid} 
//                 style={styles.friendSelectItem} 
//                 onPress={() => {
//                   handleAddMember(friend, activeRole);
//                   setIsModalVisible(false);
//                 }}
//               >
//                 <View style={styles.miniAvatar}>
//                   <ThemedText style={styles.avatarText}>{friend.displayName[0].toUpperCase()}</ThemedText>
//                 </View>
//                 <ThemedText style={{ flex: 1, marginLeft: 12 }}>{friend.displayName}</ThemedText>
//                 <Ionicons name="person-add-outline" size={20} color="#2563eb" />
//               </Pressable>
//             ))}
//           </ScrollView>
//         </AppScreen>
//       </Modal>
//     </AppScreen>
//   );
// }

// const styles = StyleSheet.create({
//   headerCard: { 
//     paddingVertical: 16, // 缩减垂直内边距，让卡片变扁平
//     paddingHorizontal: 20,
//     borderRadius: 16,     // 稍微调小圆角
//     backgroundColor: '#2563eb', 
//     alignItems: 'center', 
//     marginVertical: 10 
//   },
//   idBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
//   idBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
//   dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
//   totalAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 8 },
//   totalLabel: { color: '#fff', opacity: 0.8, fontSize: 14 },
//   sectionTitle: { marginTop: 24, marginBottom: 12 },
//   listCard: { borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, backgroundColor: '#fff' },
//   expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
//   participantsText: { fontSize: 12, opacity: 0.5, marginTop: 2 },
//   amountText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
//   inviteCard: { borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, backgroundColor: '#fff' },
//   inviteButtonsRow: { flexDirection: 'row', gap: 12 },
//   actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f0f4ff' },
//   actionText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
//   memberRow: { 
//     flexDirection: 'row', 
//     flexWrap: 'wrap', 
//     gap: 8, 
//     marginTop: 12, // 增加一点间距，不要和标题贴太死
//     paddingHorizontal: 4 
//   },
//   memberChip: { 
//     flexDirection: 'row', alignItems: 'center', 
//     paddingHorizontal: 10, paddingVertical: 6, 
//     borderRadius: 20, backgroundColor: '#f0f7ff', // 淡淡的蓝色背景
//     borderWidth: 1, borderColor: '#2563eb' 
//   },
//   miniAvatar: { 
//     width: 18, height: 18, borderRadius: 9, 
//     backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 6 
//   },
//   avatarText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
//   chipText: { fontSize: 12, color: '#2563eb', fontWeight: '500' },
//   addMemberChip: { 
//     flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, 
//     borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db' 
//   },
//   addMemberText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
//   friendSelectItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//   },

//   roleContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#f1f5f9',
//     marginTop: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2, // 针对安卓
//   },
//   roleLabel: { 
//     fontSize: 11, 
//     color: '#94a3b8', 
//     fontWeight: 'bold', 
//     marginTop: 12, 
//     marginBottom: 8,
//     textTransform: 'uppercase'
//   },
//   ownerChip: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
//   ownerText: { color: '#b45309', fontSize: 12, fontWeight: '600' },
//   payerChip: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
//   payerText: { color: '#15803d', fontSize: 12, fontWeight: '600' },
// });


// app\group\[groupId]\index.tsx
import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';
import { auth, db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { addDoc, arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useCurrency } from '@/core/currency/CurrencyContext';
import { t } from '@/core/i18n';
import { useSettings } from '@/core/settings/SettingsContext';
// import { Picker } from '@react-native-picker/picker';

type InvolvedFriend = {
  uid: string;
  displayName: string;
  claimedAmount?: string;
};

type GroupDetail = {
  id: string;
  name: string;
  startDate: string;
  totalExpenses: number;
  status: 'ongoing' | 'finished';
  involvedFriends?: InvolvedFriend[];
  receiptUrls?: string[];
  ownerId: string;
  payerIds?: string[];
  participantIds?: string[];
};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  createdAt: number;
  participants: string[];
  payers: string[];
};

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const navigation = useNavigation();
  const { language } = useSettings();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allFriends, setAllFriends] = useState<InvolvedFriend[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRole, setActiveRole] = useState<'payer' | 'participant'>('participant');
  const [activeTab, setActiveTab] = useState<'owner' | 'payer' | 'participant'>('owner');

  // Add Expense 相关状态
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  // 多币种输入
  const { defaultCurrency, convertAmount, supportedCurrencies, currencySymbols } = useCurrency();
  const [inputCurrency, setInputCurrency] = useState(defaultCurrency);
  const [expenseAmount, setExpenseAmount] = useState(''); // 输入框金额
  const [convertedAmount, setConvertedAmount] = useState<string>(''); // 主币种金额
  const [isConverting, setIsConverting] = useState(false);
  const [splitMode, setSplitMode] = useState<'equal' | 'ratio' | 'custom'>('equal');
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [ratios, setRatios] = useState<{ [uid: string]: string }>({});
  const [customAmounts, setCustomAmounts] = useState<{ [uid: string]: string }>({});
  // 币种选择 Modal 状态
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // 新增：Receipts 相关状态
  const [receipts, setReceipts] = useState<string[]>([]);

  // --- 1. 删除成员逻辑 (修正版) ---
  const handleRemoveMember = async (person: InvolvedFriend, role: 'payer' | 'participant') => {
    if (!groupId || !group) return;

    const performDelete = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const updateData: any = {};
        
        // 获取最新的数组快照，防止闭包旧数据干扰
        const currentPayers = group.payerIds || [];
        const currentParticipants = group.participantIds || [];

        // 1. 移除对应角色的 ID
        if (role === 'payer') {
          updateData.payerIds = arrayRemove(person.uid);
        } else {
          updateData.participantIds = arrayRemove(person.uid);
        }
        
        // 2. 逻辑判断：如果删了这个角色后，他不再担任任何角色，则从总名单移除
        // 检查他是否还在另一个列表里
        const remainsInOtherRole = role === 'payer' 
          ? currentParticipants.includes(person.uid) 
          : currentPayers.includes(person.uid);

        if (!remainsInOtherRole) {
          // 💡 极其重要：必须手动剔除除了 uid 和 displayName 以外的所有字段（如 claimedAmount）
          // 否则 Firebase arrayRemove 找不到完全一样的对象，就会静默失败！
          const basicPerson = { uid: person.uid, displayName: person.displayName };
          updateData.involvedFriends = arrayRemove(basicPerson);
        }

        await updateDoc(groupRef, updateData);
      } catch (error) {
        console.error("Delete failed:", error);
        Alert.alert("Error", "Failed to remove member.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${person.displayName}?`)) performDelete();
    } else {
      Alert.alert("Remove Member", `Remove ${person.displayName}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: performDelete, style: "destructive" }
      ]);
    }
  };

  // --- 2. 添加成员逻辑 (严谨版) ---
  const handleAddMember = async (friend: InvolvedFriend, role: 'payer' | 'participant') => {
    if (!groupId || !group) return;

    const isAlreadyPayer = group.payerIds?.includes(friend.uid);
    const isAlreadyParticipant = group.participantIds?.includes(friend.uid);

    if (role === 'payer' && isAlreadyPayer) return;
    if (role === 'participant' && isAlreadyParticipant) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      
      // 💡 关键修改：只提取最基础的字段，避免 claimedAmount 干扰匹配
      const basicFriend = { uid: friend.uid, displayName: friend.displayName };
      
      const updateData: any = {
        involvedFriends: arrayUnion(basicFriend) 
      };

      if (role === 'payer') {
        updateData.payerIds = arrayUnion(friend.uid);
        // 支付者一定是参与者
        if (!isAlreadyParticipant) {
          updateData.participantIds = arrayUnion(friend.uid);
        }
      } else {
        // 💡 参与者仅更新自己，不碰 payerIds
        updateData.participantIds = arrayUnion(friend.uid);
      }

      await updateDoc(groupRef, updateData);
    } catch (e) {
      console.error("Add member error:", e);
    }
  };
  // --- 3. 认领金额逻辑 ---
  const handleClaimAmount = (person: InvolvedFriend) => {
    const onConfirm = async (value: string | null) => {
      if (!value || isNaN(Number(value)) || !groupId) return;
      try {
        const groupRef = doc(db, "groups", groupId);
        const newFriends = group?.involvedFriends?.map((f) => 
          f.uid === person.uid ? { ...f, claimedAmount: value } : f
        ) || [];
        await updateDoc(groupRef, { involvedFriends: newFriends });
      } catch (e) { console.error(e); }
    };

    if (Platform.OS === 'web') {
      const val = window.prompt(`Claim amount for ${person.displayName}:`, person.claimedAmount || "");
      onConfirm(val);
    } else {
      Alert.prompt("Claim Amount", "Enter amount:", (v) => onConfirm(v), "plain-text", person.claimedAmount || "");
    }
  };



  // --- 5. 重置 Expense 表单 ---
  const resetExpenseForm = () => {
    setExpenseTitle('');
    setExpenseAmount('');
    setConvertedAmount('');
    setInputCurrency(defaultCurrency);
    setIsConverting(false);
    setSplitMode('equal');
    setSelectedPayers([]);
    setSelectedParticipants([]);
    setRatios({});
    setCustomAmounts({});
    setReceipts([]);
  };

  // 选择收据图片
  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload receipts.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        setReceipts((prev) => [...prev, newUri]);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick receipt image');
    }
  };

  // --- 6. 打开 Expense Modal ---
  const openExpenseModal = () => {
    // 默认选中所有参与者
    const allParticipantIds = group?.participantIds || [];
    setSelectedParticipants(allParticipantIds);
    // 默认选中所有付款人
    const allPayerIds = group?.payerIds || [];
    setSelectedPayers(allPayerIds.length > 0 ? allPayerIds : (auth.currentUser ? [auth.currentUser.uid] : []));
    setShowExpenseModal(true);
  };

  // --- 7. 保存 Expense ---
  const handleSaveExpense = async () => {
    // 以主币种金额为准
    const amount = parseFloat(convertedAmount);
    if (!expenseTitle.trim() || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid title and amount');
      return;
    }
    if (selectedParticipants.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }
    if (selectedPayers.length === 0) {
      Alert.alert('Error', 'Please select at least one payer');
      return;
    }

    try {
      // 计算每人应付金额
      let splits: { [uid: string]: number } = {};
      if (splitMode === 'equal') {
        const perPerson = amount / selectedParticipants.length;
        selectedParticipants.forEach(uid => {
          splits[uid] = perPerson;
        });
      } else if (splitMode === 'ratio') {
        let totalRatio = 0;
        selectedParticipants.forEach(uid => {
          totalRatio += parseFloat(ratios[uid] || '1');
        });
        selectedParticipants.forEach(uid => {
          const ratio = parseFloat(ratios[uid] || '1');
          splits[uid] = (ratio / totalRatio) * amount;
        });
      } else {
        selectedParticipants.forEach(uid => {
          splits[uid] = parseFloat(customAmounts[uid] || '0');
        });
      }

      const expenseData = {
        title: expenseTitle.trim(),
        amount: amount,
        inputCurrency: inputCurrency,
        inputAmount: parseFloat(expenseAmount),
        splitMode: splitMode,
        payers: selectedPayers,
        participants: selectedParticipants,
        splits: splits,
        createdAt: Date.now(),
        createdBy: auth.currentUser?.uid,
      };

      await addDoc(collection(db, "groups", groupId!, "expenses"), expenseData);
      await updateDoc(doc(db, "groups", groupId!), {
        totalExpenses: increment(amount)
      });
      setShowExpenseModal(false);
      resetExpenseForm();
      Alert.alert('Success', 'Expense added successfully!');
    } catch (e) {
      console.error('Save expense error:', e);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  useEffect(() => {
    if (!groupId) return;
    const staticGroup = MOCK_GROUPS_DATA[groupId];
    if (staticGroup) { setGroup(staticGroup); setLoading(false); return; }

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) { setLoading(false); return; }
      const unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
        if (snap.exists()) setGroup({ id: snap.id, ...snap.data() } as GroupDetail);
        setLoading(false);
      });
      const unsubExpenses = onSnapshot(query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc")), (snap) => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[]);
      });
      const unsubFriends = onSnapshot(query(collection(db, "users", user.uid, "friends"), orderBy("displayName", "asc")), (snap) => {
        setAllFriends(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as any);
      });
      return () => { unsubGroup(); unsubExpenses(); unsubFriends(); };
    });
    return () => unsubAuth();
  }, [groupId]);

  if (loading) return <AppScreen><ActivityIndicator style={{marginTop: 50}} /></AppScreen>;
  if (!group) return <AppScreen><AppTopBar title="Error" showBack /><ThemedText>Group Not Found</ThemedText></AppScreen>;

  return (
    <AppScreen>
      <AppTopBar title={group.name} showBack onBackPress={() => navigation.canGoBack() ? router.back() : router.replace("/")} rightIconName="chatbubbles-outline" onRightIconPress={() => router.push(`/group/${group.id}/chat`)} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        <ThemedView style={styles.headerCard}>
          <View style={styles.idBadge}><ThemedText style={styles.idBadgeText}>BILL NO: {group.id}</ThemedText></View>
          <ThemedText style={styles.dateText}>{t('created')} {group.startDate}</ThemedText>
          <ThemedText type="title" style={styles.totalAmount}>{group.totalExpenses.toFixed(2)} €</ThemedText>
          <ThemedText style={styles.totalLabel}>{t('totalSpending')}</ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Group Members</ThemedText>
        
        {/* Tab 切换栏 */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'owner' && styles.activeTab]}
            onPress={() => setActiveTab('owner')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'owner' && styles.activeTabText]}>
              Owner
            </ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'payer' && styles.activeTab]}
            onPress={() => setActiveTab('payer')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'payer' && styles.activeTabText]}>
              Paid By
            </ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'participant' && styles.activeTab]}
            onPress={() => setActiveTab('participant')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'participant' && styles.activeTabText]}>
              Splitting
            </ThemedText>
          </Pressable>
        </View>

        {/* 成员内容区域 */}
        <View style={styles.roleContainer}>
          {/* Owner Tab 内容 */}
          {activeTab === 'owner' && (
            <View style={styles.memberContent}>
              <ThemedText style={styles.tabHint}>Group creator and organizer</ThemedText>
              <View style={styles.memberRow}>
                {group.involvedFriends?.filter(f => f.uid === group.ownerId).map((f, i) => (
                  <View key={`owner-${f.uid}-${i}`} style={[styles.memberChip, styles.ownerChip]}>
                    <View style={styles.memberAvatar}>
                      <ThemedText style={styles.memberAvatarText}>{f.displayName[0].toUpperCase()}</ThemedText>
                    </View>
                    <ThemedText style={styles.ownerText}>{f.displayName}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Paid By Tab 内容 */}
          {activeTab === 'payer' && (
            <View style={styles.memberContent}>
              <ThemedText style={styles.tabHint}>People who paid for expenses</ThemedText>
              <View style={styles.memberRow}>
                {group.involvedFriends?.filter(f => group.payerIds?.includes(f.uid)).map((f, i) => (
                  <Pressable 
                    key={`payer-${f.uid}-${i}`} 
                    style={[styles.memberChip, styles.payerChip]} 
                    onPress={() => handleClaimAmount(f)}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: '#10b981' }]}>
                      <ThemedText style={styles.memberAvatarText}>{f.displayName[0].toUpperCase()}</ThemedText>
                    </View>
                    <ThemedText style={styles.payerText}>{f.displayName}</ThemedText>
                    {f.claimedAmount && (
                      <View style={styles.amountBadge}>
                        <ThemedText style={styles.amountBadgeText}>{f.claimedAmount}€</ThemedText>
                      </View>
                    )}
                    <Pressable 
                      onPress={(e) => { e.stopPropagation(); handleRemoveMember(f, 'payer'); }} 
                      style={styles.deleteBtn}
                    >
                      <ThemedText style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>×</ThemedText>
                    </Pressable>
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.addMemberChip} 
                  onPress={() => { setActiveRole('payer'); setIsModalVisible(true); }}
                >
                  <ThemedText style={[styles.addMemberText, { color: '#10b981' }]}>+ Add Payer</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {/* Splitting With Tab 内容 */}
          {activeTab === 'participant' && (
            <View style={styles.memberContent}>
              <ThemedText style={styles.tabHint}>People splitting the expenses</ThemedText>
              <View style={styles.memberRow}>
                {group.involvedFriends?.filter(f => group.participantIds?.includes(f.uid)).map((f, i) => (
                  <Pressable 
                    key={`part-${f.uid}-${i}`} 
                    style={styles.memberChip} 
                    onPress={() => handleClaimAmount(f)}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: '#2563eb' }]}>
                      <ThemedText style={styles.memberAvatarText}>{f.displayName[0].toUpperCase()}</ThemedText>
                    </View>
                    <ThemedText style={styles.chipText}>{f.displayName}</ThemedText>
                    {f.claimedAmount && (
                      <View style={styles.amountBadge}>
                        <ThemedText style={styles.amountBadgeText}>{f.claimedAmount}€</ThemedText>
                      </View>
                    )}
                    <Pressable 
                      onPress={(e) => { e.stopPropagation(); handleRemoveMember(f, 'participant'); }} 
                      style={styles.deleteBtn}
                    >
                      <ThemedText style={{ color: '#2563eb', fontSize: 14, fontWeight: '600' }}>×</ThemedText>
                    </Pressable>
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.addMemberChip} 
                  onPress={() => { setActiveRole('participant'); setIsModalVisible(true); }}
                >
                  <ThemedText style={[styles.addMemberText, { color: '#2563eb' }]}>+ Add Member</ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Expense History */}
        <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 }}>Expense History</ThemedText>
        {expenses.length === 0 ? (
          <ThemedText style={{ opacity: 0.6, textAlign: 'center', padding: 20 }}>No expenses yet</ThemedText>
        ) : (
          <View>
            {expenses.map((item) => (
              <View key={item.id} style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 12, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={{ fontWeight: '600', fontSize: 14, color: '#1e293b' }}>{item.title}</ThemedText>
                  <ThemedText style={{ fontWeight: 'bold', fontSize: 14, color: '#2563eb' }}>€{item.amount.toFixed(2)}</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Paid by: {item.payers?.map((payerId: string) => group.involvedFriends?.find(f => f.uid === payerId)?.displayName).filter(Boolean).join(', ') || 'Unknown'}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: '#64748b' }}>Split with: {item.participants?.map((participantId: string) => group.involvedFriends?.find(f => f.uid === participantId)?.displayName).filter(Boolean).join(', ') || 'Everyone'}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Add New Expense 按钮 */}
        <Pressable style={styles.addExpenseBtn} onPress={openExpenseModal}>
          <ThemedText style={styles.addExpenseBtnText}>+ Add New Expense</ThemedText>
        </Pressable>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showExpenseModal} animationType="slide">
        <AppScreen>
          <View style={{ marginTop: 20 }}>
            <AppTopBar title="Add Expense" showBack onBackPress={() => { setShowExpenseModal(false); resetExpenseForm(); }} />
          </View>
          <ScrollView style={{ padding: 16 }}>
            {/* Expense Title */}
            <ThemedText style={styles.expenseLabel}>Expense Name</ThemedText>
            <TextInput
              style={styles.expenseInput}
              placeholder="e.g. Dinner, Transport..."
              placeholderTextColor="#94a3b8"
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />


            {/* Total Amount - 多币种输入 */}
            <ThemedText style={styles.expenseLabel}>Total Amount</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.expenseInput, { flex: 1 }]}
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={expenseAmount}
                onChangeText={async (val) => {
                  setExpenseAmount(val);
                  if (!val || isNaN(Number(val))) {
                    setConvertedAmount('');
                    return;
                  }
                  setIsConverting(true);
                  const res = await convertAmount(Number(val), inputCurrency, defaultCurrency);
                  setConvertedAmount(res !== null ? res.toFixed(2) : '');
                  setIsConverting(false);
                }}
              />
              <View style={{ width: 12 }} />
              <View style={[styles.expenseInput, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingHorizontal: 0, flex: undefined, width: Platform.OS === 'ios' ? 120 : 90, minWidth: 90, height: 48, marginBottom: 0 }]}> 
                <Pressable
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 12, justifyContent: 'space-between' }}
                  onPress={() => setShowCurrencyModal(true)}
                  accessibilityRole="button"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={{ fontWeight: 'bold', color: '#2563eb', fontSize: 15 }}>{currencySymbols[inputCurrency]} </ThemedText>
                    <ThemedText style={{ fontWeight: 'bold', color: '#2563eb', fontSize: 15 }}>{inputCurrency}</ThemedText>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#2563eb" style={{ marginLeft: 6 }} />
                </Pressable>
                {/* 币种选择 Modal */}
                <Modal
                  visible={!!showCurrencyModal}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCurrencyModal(false)}
                >
                  <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setShowCurrencyModal(false)} />
                  <View style={{ position: 'absolute', top: '40%', left: '10%', right: '10%', backgroundColor: '#fff', borderRadius: 8, padding: 16, elevation: 8 }}>
                    {supportedCurrencies.map((cur) => (
                      <Pressable
                        key={cur}
                        style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                        onPress={async () => {
                          setInputCurrency(cur);
                          setShowCurrencyModal(false);
                          if (expenseAmount && !isNaN(Number(expenseAmount))) {
                            setIsConverting(true);
                            const res = await convertAmount(Number(expenseAmount), cur, defaultCurrency);
                            setConvertedAmount(res !== null ? res.toFixed(2) : '');
                            setIsConverting(false);
                          } else {
                            setConvertedAmount('');
                          }
                        }}
                      >
                        <ThemedText style={{ fontSize: 16, color: cur === inputCurrency ? '#2563eb' : '#1e293b', fontWeight: cur === inputCurrency ? 'bold' : 'normal' }}>
                          {currencySymbols[cur]} {cur}
                        </ThemedText>
                        {cur === inputCurrency && <Ionicons name="checkmark" size={16} color="#2563eb" style={{ marginLeft: 8 }} />}
                      </Pressable>
                    ))}
                  </View>
                </Modal>
              </View>
            </View>
            {/* 显示主币种金额 */}
            <ThemedText style={{ color: '#2563eb', fontWeight: 'bold', marginBottom: 8 }}>
              {isConverting ? 'Converting...' : (convertedAmount ? `≈ ${currencySymbols[defaultCurrency]}${convertedAmount} (${defaultCurrency})` : '')}
            </ThemedText>

            {/* Split Mode Selection */}
            <ThemedText style={styles.expenseLabel}>Split Mode</ThemedText>
            <View style={styles.splitModeContainer}>
              <Pressable
                style={[styles.splitModeBtn, splitMode === 'equal' && styles.splitModeBtnActive]}
                onPress={() => setSplitMode('equal')}
              >
                <ThemedText style={[styles.splitModeText, splitMode === 'equal' && styles.splitModeTextActive]}>Equal</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.splitModeBtn, splitMode === 'ratio' && styles.splitModeBtnActive]}
                onPress={() => setSplitMode('ratio')}
              >
                <ThemedText style={[styles.splitModeText, splitMode === 'ratio' && styles.splitModeTextActive]}>Ratio</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.splitModeBtn, splitMode === 'custom' && styles.splitModeBtnActive]}
                onPress={() => setSplitMode('custom')}
              >
                <ThemedText style={[styles.splitModeText, splitMode === 'custom' && styles.splitModeTextActive]}>Custom</ThemedText>
              </Pressable>
            </View>

            {/* Payers Selection */}
            <ThemedText style={styles.expenseLabel}>Who Paid?</ThemedText>
            <View style={styles.participantGrid}>
              {group.involvedFriends?.map((f) => (
                <Pressable
                  key={`payer-select-${f.uid}`}
                  style={[
                    styles.participantChip,
                    selectedPayers.includes(f.uid) && styles.participantChipActive
                  ]}
                  onPress={() => {
                    setSelectedPayers(prev =>
                      prev.includes(f.uid)
                        ? prev.filter(id => id !== f.uid)
                        : [...prev, f.uid]
                    );
                  }}
                >
                  <ThemedText style={[
                    styles.participantChipText,
                    selectedPayers.includes(f.uid) && styles.participantChipTextActive
                  ]}>{f.displayName}</ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Participants Selection */}
            <ThemedText style={styles.expenseLabel}>Split With</ThemedText>
            <View style={styles.participantGrid}>
              {group.involvedFriends?.map((f) => (
                <Pressable
                  key={`participant-select-${f.uid}`}
                  style={[
                    styles.participantChip,
                    selectedParticipants.includes(f.uid) && styles.participantChipActive
                  ]}
                  onPress={() => {
                    setSelectedParticipants(prev =>
                      prev.includes(f.uid)
                        ? prev.filter(id => id !== f.uid)
                        : [...prev, f.uid]
                    );
                  }}
                >
                  <ThemedText style={[
                    styles.participantChipText,
                    selectedParticipants.includes(f.uid) && styles.participantChipTextActive
                  ]}>{f.displayName}</ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Ratio Input (only shown in ratio mode) */}
            {splitMode === 'ratio' && (
              <View style={styles.splitDetailsContainer}>
                <ThemedText style={styles.expenseLabel}>Set Ratios</ThemedText>
                {selectedParticipants.map(uid => {
                  const person = group.involvedFriends?.find(f => f.uid === uid);
                  return (
                    <View key={`ratio-${uid}`} style={styles.splitRow}>
                      <ThemedText style={styles.splitRowName}>{person?.displayName || 'Unknown'}</ThemedText>
                      <TextInput
                        style={styles.splitInput}
                        placeholder="1"
                        placeholderTextColor="#94a3b8"
                        keyboardType="decimal-pad"
                        value={ratios[uid] || ''}
                        onChangeText={(v) => setRatios(prev => ({ ...prev, [uid]: v }))}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Custom Amount Input (only shown in custom mode) */}
            {splitMode === 'custom' && (
              <View style={styles.splitDetailsContainer}>
                <ThemedText style={styles.expenseLabel}>Set Amounts (€)</ThemedText>
                {selectedParticipants.map(uid => {
                  const person = group.involvedFriends?.find(f => f.uid === uid);
                  return (
                    <View key={`custom-${uid}`} style={styles.splitRow}>
                      <ThemedText style={styles.splitRowName}>{person?.displayName || 'Unknown'}</ThemedText>
                      <TextInput
                        style={styles.splitInput}
                        placeholder="0.00"
                        placeholderTextColor="#94a3b8"
                        keyboardType="decimal-pad"
                        value={customAmounts[uid] || ''}
                        onChangeText={(v) => setCustomAmounts(prev => ({ ...prev, [uid]: v }))}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Preview */}
            {splitMode === 'equal' && selectedParticipants.length > 0 && expenseAmount && (
              <View style={styles.previewContainer}>
                <ThemedText style={styles.previewTitle}>Preview (Equal Split)</ThemedText>
                <ThemedText style={styles.previewText}>
                  Each person pays: €{(parseFloat(expenseAmount) / selectedParticipants.length).toFixed(2)}
                </ThemedText>
              </View>
            )}

            {/* Receipts 部分 */}
            <ThemedText style={styles.expenseLabel}>Receipts (Optional)</ThemedText>
            <ThemedText style={{ fontSize: 12, color: '#ffffff', marginBottom: 8 }}>{receipts.length} receipt(s) selected</ThemedText>
            
            {receipts.length > 0 && (
              <View style={styles.receiptsGrid}>
                {receipts.map((uri, index) => (
                  <View key={index} style={styles.receiptThumbnail}>
                    <Image source={{ uri }} style={styles.receiptImage} />
                    <Pressable
                      style={styles.removeReceiptBtn}
                      onPress={() => setReceipts((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            
            <Pressable
              onPress={pickReceipt}
              hitSlop={15}
              style={styles.addReceiptBtn}
            >
              <PixelIcon name="add" size={20} color="#2563eb" />
              <ThemedText style={{ color: '#2563eb', marginLeft: 8, fontWeight: '600', flex: 1 }}>Add Receipt</ThemedText>
              {receipts.length > 0 && <ThemedText style={{ color: '#2563eb', fontWeight: 'bold' }}>{receipts.length}</ThemedText>}
            </Pressable>

            {/* Save Button */}
            <Pressable style={styles.saveExpenseBtn} onPress={handleSaveExpense}>
              <ThemedText style={styles.saveExpenseBtnText}>Save Expense</ThemedText>
            </Pressable>
          </ScrollView>
        </AppScreen>
      </Modal>

      {/* 好友选择 Modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <AppScreen>
          <View style={{ marginTop: 20 }}>
            <AppTopBar title={t('step4Title')} showBack onBackPress={() => setIsModalVisible(false)} />
          </View>
          <ScrollView style={{ padding: 16 }}>
            {/* “我”的选项 - 增加了显眼的样式 */}
            {auth.currentUser && (
              <Pressable 
                style={[styles.friendSelectItem, styles.meItem]} 
                onPress={() => {
                  handleAddMember({
                    uid: auth.currentUser!.uid,
                    displayName: auth.currentUser!.displayName || "Me"
                  }, activeRole!);
                  setIsModalVisible(false);
                }}
              >
                <View style={styles.miniAvatar}>
                  <ThemedText style={styles.avatarText}>ME</ThemedText>
                </View>
                <ThemedText style={{ flex: 1, marginLeft: 12, fontWeight: 'bold', color: '#2563eb' }}>
                  Me ({auth.currentUser.displayName || "Myself"})
                </ThemedText>
                <Ionicons name="star" size={20} color="#2563eb" />
              </Pressable>
            )}
            {allFriends.map((friend) => (
              <Pressable key={friend.uid} style={styles.friendSelectItem} onPress={() => { handleAddMember(friend, activeRole!); setIsModalVisible(false); }}>
                <ThemedText style={{ flex: 1 }}>{friend.displayName}</ThemedText>
                <Ionicons name="person-add-outline" size={20} color="#2563eb" />
              </Pressable>
            ))}
          </ScrollView>
        </AppScreen>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerCard: { padding: 20, borderRadius: 0, backgroundColor: '#2563eb', alignItems: 'center', marginVertical: 10, borderWidth: 3, borderColor: '#1e40af' },
  idBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 0, marginBottom: 12 },
  idBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'monospace' },
  dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  totalAmount: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 8 },
  totalLabel: { color: '#fff', opacity: 0.8, fontSize: 14 },
  sectionTitle: { marginTop: 24, marginBottom: 12 },
  
  // Tab 样式 - 像素风
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 0,
    padding: 4,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 0,
  },
  activeTab: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#1e293b',
  },
  
  // 成员区域 - 像素风
  roleContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 0,
    padding: 16, 
    borderWidth: 2, 
    borderTopWidth: 0,
    borderColor: '#60a5fa' 
  },
  memberContent: {
    minHeight: 80,
  },
  tabHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 4, 
    paddingRight: 8, 
    paddingVertical: 6, 
    borderRadius: 0, 
    backgroundColor: '#f0f7ff', 
    borderWidth: 2, 
    borderColor: '#2563eb',
  },
  ownerChip: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
  payerChip: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownerText: { color: '#b45309', fontSize: 13, fontWeight: '600' },
  payerText: { color: '#15803d', fontSize: 13, fontWeight: '600' },
  chipText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  amountBadge: { 
    backgroundColor: '#22c55e', 
    marginLeft: 6, 
    paddingHorizontal: 6, 
    paddingVertical: 2,
    borderRadius: 0 
  },
  amountBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  deleteBtn: { marginLeft: 4, padding: 2 },
  addMemberChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 0, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#d1d5db',
    gap: 4,
  },
  addMemberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  friendSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 0,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  meItem: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
  },
  miniAvatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 0, 
    backgroundColor: '#2563eb', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatarText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  
  // Add Expense 样式 - 像素风
  addExpenseBtn: {
    backgroundColor: '#2563eb',
    borderWidth: 3,
    borderColor: '#1e40af',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  addExpenseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  expenseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  expenseInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#60a5fa',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  splitModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  splitModeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 0,
  },
  splitModeBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1e40af',
  },
  splitModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  splitModeTextActive: {
    color: '#fff',
  },
  participantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 0,
  },
  participantChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  participantChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  participantChipTextActive: {
    color: '#1e40af',
  },
  splitDetailsContainer: {
    marginTop: 8,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 0,
  },
  splitRowName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  splitInput: {
    width: 80,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#60a5fa',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#1e293b',
  },
  previewContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 0,
    padding: 16,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#166534',
  },
  receiptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  receiptThumbnail: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  addReceiptBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'solid',
    backgroundColor: '#ffffff',
  },
  saveExpenseBtn: {
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#15803d',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveExpenseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});