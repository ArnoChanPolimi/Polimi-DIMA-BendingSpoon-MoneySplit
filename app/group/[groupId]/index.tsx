// app\group\[groupId]\index.tsx
import { auth, db, uploadImageAndGetUrl } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { arrayUnion, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// 1. 修改导入
import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import * as ImagePicker from 'expo-image-picker';


type GroupDetail = {
  id: string;
  name: string;
  startDate: string;
  totalExpenses: number;
  status: 'ongoing' | 'finished';
  involvedFriends?: { uid: string; displayName: string }[]; // 因为在 QuickAdd 存的是这个字段
  receiptUrls?: string[];
  ownerId: string;       // 补上这个
  payerIds?: string[];   // 补上这个
  participantIds?: string[]; // 补上这个
};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  createdAt: number;
  participants: string[];
};

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allFriends, setAllFriends] = useState<{ uid: string; displayName: string }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRole, setActiveRole] = useState<'payer' | 'participant'>('participant');

  // 1. 在组件内定义更新逻辑
  const handleAddMember = async (friend: { uid: string, displayName: string }, role: 'payer' | 'participant') => {
    if (!groupId) return;
    try {
      const groupRef = doc(db, "groups", groupId);
      
      // 构建更新数据
      const updateData: any = {
        involvedFriends: arrayUnion(friend), // 所有人都要进 involvedFriends
      };

      // 根据角色决定进哪个 ID 数组
      if (role === 'payer') {
        updateData.payerIds = arrayUnion(friend.uid);
      } else {
        updateData.participantIds = arrayUnion(friend.uid);
      }

      await updateDoc(groupRef, updateData);
    } catch (error) {
      console.error("Add member error:", error);
      Alert.alert("Error", "Failed to add member.");
    }
  };
  // 追加上传小票逻辑
  const handleAddReceipt = async () => {
    // 1. 权限检查 (针对 iOS/Android)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need camera roll permissions to upload receipts.");
      return;
    }

    try {
      // 2. 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && groupId) {
        setLoading(true); // 开启全局 Loading 或局部的上传状态
        const newUri = result.assets[0].uri;
        
        // 3. 上传到 Firebase Storage
        // 这里沿用你的 uniqueBillId 逻辑，直接用 groupId 作为文件夹名
        const uploadedUrl = await uploadImageAndGetUrl(newUri, groupId);

        // 4. 追加到 Firestore 的 receiptUrls 数组中
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, {
          receiptUrls: arrayUnion(uploadedUrl)
        });

        setLoading(false);
        Alert.alert("Success", "Receipt added successfully!");
      }
    } catch (error) {
      setLoading(false);
      console.error("Upload failed:", error);
      Alert.alert("Error", "Failed to upload receipt.");
    }
  };

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    // 1. 静态数据检查
    const staticGroup = MOCK_GROUPS_DATA[groupId];
    if (staticGroup) {
      setGroup(staticGroup);
      setLoading(false);
      return;
    }

    // 2. 核心逻辑：监听 Auth 和 Data
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("No user found, resetting state");
        // 必须加上这几行，否则切换账号后，旧账号的数据还会挂在屏幕上
        setGroup(null);
        setExpenses([]);
        setAllFriends([]);
        setLoading(false); 
        return;
      }

      // 只有确定有 user 了，才开启 Firestore 监听
      const unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setGroup({ id: snap.id, ...data } as GroupDetail);
        }
        setLoading(false); // ✅ 成功获取数据后关闭
      }, (err) => {
        console.error(err);
        setLoading(false); // ✅ 报错也要关闭
      });

      const unsubExpenses = onSnapshot(
        query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc")),
        (snap) => {
          setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[]);
        }
      );

      const friendsRef = collection(db, "users", user.uid, "friends");
      const unsubFriends = onSnapshot(query(friendsRef, orderBy("displayName", "asc")), (snap) => {
        setAllFriends(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as any);
      });

      // 清理函数嵌套
      return () => {
        unsubGroup();
        unsubExpenses();
        unsubFriends();
      };
    });

    return () => unsubAuth();
  }, [groupId]);

  if (loading) return <AppScreen><AppTopBar title="Loading..." showBack /><ThemedText style={{padding:20}}>Fetching...</ThemedText></AppScreen>;
  if (!group) return <AppScreen><AppTopBar title="Error" showBack /><ThemedText style={{padding:20}}>Group Not Found</ThemedText></AppScreen>;

  return (
    <AppScreen>
      <AppTopBar
        title={group.name}
        showBack
        rightIconName="chatbubbles-outline"
        onRightIconPress={() => router.push(`/group/${group.id}/chat`)}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        {/* 顶部蓝色概览卡片 */}
        <ThemedView style={styles.headerCard}>
          {/* 【修改点 3】增加显眼的唯一 ID 展示 */}
          <View style={styles.idBadge}>
            <ThemedText style={styles.idBadgeText}>BILL NO: {group.id}</ThemedText>
          </View>

          <ThemedText style={styles.dateText}>Created on {group.startDate}</ThemedText>
          <ThemedText type="title" style={styles.totalAmount}>
            {group.totalExpenses.toFixed(2)} €
          </ThemedText>
          <ThemedText style={styles.totalLabel}>Total Group Spending</ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Expense History</ThemedText>
        <ThemedView style={styles.listCard}>
          {expenses.length === 0 ? (
            <ThemedText style={{ opacity: 0.5, textAlign: 'center', padding: 20 }}>No records found.</ThemedText>
          ) : (
            expenses.map((item) => (
              <View key={item.id} style={styles.expenseRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                  <ThemedText style={styles.participantsText}>Involved: {item.participants?.join(', ') || 'Everyone'}</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.amountText}>-{item.amount.toFixed(2)} €</ThemedText>
              </View>
            ))
          )}
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Group Members</ThemedText>
        <View style={styles.roleContainer}>
          {/* 1. Owner 区域 */}
          <ThemedText style={styles.roleLabel}>👑 Owner (Organizer)</ThemedText>
          <View style={styles.memberRow}>
            {group.involvedFriends?.filter(f => {
              // 确保 f 存在且 uid 匹配
              return f && f.uid === group.ownerId;
            }).map(f => (
              <View key={`owner-${f.uid}`} style={[styles.memberChip, styles.ownerChip]}>
                <Ionicons name="ribbon" size={12} color="#f59e0b" style={{marginRight: 4}} />
                <ThemedText style={styles.ownerText}>
                  {f.uid === auth.currentUser?.uid ? "Me (Owner)" : f.displayName}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* 2. Payers 区域 */}
          <ThemedText style={styles.roleLabel}>💳 Paid By</ThemedText>
          <View style={styles.memberRow}>
            {group.involvedFriends?.filter(f => group.payerIds?.includes(f.uid)).map(f => (
              <View key={`payer-${f.uid}`} style={[styles.memberChip, styles.payerChip]}>
                <Ionicons name="card" size={12} color="#10b981" style={{marginRight: 4}} />
                <ThemedText style={styles.payerText}>{f.displayName}</ThemedText>
              </View>
            ))}

            {/* 💡 补上这个按键 */}
            <Pressable 
              style={styles.addMemberChip} 
              onPress={() => {
                setActiveRole('payer'); // 关键：标记我是要加付款人
                setIsModalVisible(true);
              }}
            >
              <Ionicons name="add" size={14} color="#6b7280" />
              <ThemedText style={styles.addMemberText}>Add</ThemedText>
            </Pressable>
          </View>
          {/* 3. Participants 区域 */}
          <ThemedText style={styles.roleLabel}>👥 Splitting With</ThemedText>
          <View style={styles.memberRow}>
            {group.involvedFriends?.filter(f => group.participantIds?.includes(f.uid)).map(f => (
              <View key={`part-${f.uid}`} style={styles.memberChip}>
                <ThemedText style={styles.chipText}>{f.displayName}</ThemedText>
              </View>
            ))}
            
            {/* 3. Participants 区域的按钮 */}
            <Pressable 
              style={styles.addMemberChip} 
              onPress={() => {
                setActiveRole('participant'); // 关键：标记我是要加分摊者
                setIsModalVisible(true);
              }}
            >
              <Ionicons name="add" size={14} color="#6b7280" />
              <ThemedText style={styles.addMemberText}>Add</ThemedText>
            </Pressable>
          </View>
        </View>
        {/* --- 新增：小票展示区域 --- */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Receipts</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.receiptScroll}>
          {/* 1. 已有的小票列表 */}
          {group.receiptUrls?.map((url, index) => (
            <Pressable key={index}>
              <Image source={{ uri: url }} style={styles.receiptImage} />
            </Pressable>
          ))}

          {/* 2. 新增的“追加上传”按钮 */}
          <Pressable 
            style={styles.addReceiptBtn} 
            onPress={handleAddReceipt}
            disabled={loading}
          >
            {loading ? (
              <ThemedText style={styles.addReceiptText}>Uploading...</ThemedText>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={32} color="#64748b" />
                <ThemedText style={styles.addReceiptText}>Add More</ThemedText>
              </>
            )}
          </Pressable>
        </ScrollView>
      </ScrollView>
      {/* 选择好友的弹窗 */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <AppScreen>
          <AppTopBar title="Add Members" showBack onBackPress={() => setIsModalVisible(false)} />
          <ScrollView style={{ padding: 16 }}>
            {allFriends.map((friend) => (
              <Pressable 
                key={friend.uid} 
                style={styles.friendSelectItem} 
                onPress={() => {
                  handleAddMember(friend, activeRole);
                  setIsModalVisible(false);
                }}
              >
                <View style={styles.miniAvatar}>
                  <ThemedText style={styles.avatarText}>{friend.displayName[0].toUpperCase()}</ThemedText>
                </View>
                <ThemedText style={{ flex: 1, marginLeft: 12 }}>{friend.displayName}</ThemedText>
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
  headerCard: { 
    paddingVertical: 16, // 缩减垂直内边距，让卡片变扁平
    paddingHorizontal: 20,
    borderRadius: 16,     // 稍微调小圆角
    backgroundColor: '#2563eb', 
    alignItems: 'center', 
    marginVertical: 10 
  },
  idBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  idBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  totalAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 8 },
  totalLabel: { color: '#fff', opacity: 0.8, fontSize: 14 },
  sectionTitle: { marginTop: 24, marginBottom: 12 },
  listCard: { borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, backgroundColor: '#fff' },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  participantsText: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  amountText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  inviteCard: { borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, backgroundColor: '#fff' },
  inviteButtonsRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f0f4ff' },
  actionText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  memberRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 12, // 增加一点间距，不要和标题贴太死
    paddingHorizontal: 4 
  },
  memberChip: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 10, paddingVertical: 6, 
    borderRadius: 20, backgroundColor: '#f0f7ff', // 淡淡的蓝色背景
    borderWidth: 1, borderColor: '#2563eb' 
  },
  miniAvatar: { 
    width: 18, height: 18, borderRadius: 9, 
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 6 
  },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  chipText: { fontSize: 12, color: '#2563eb', fontWeight: '500' },
  addMemberChip: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, 
    borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db' 
  },
  addMemberText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  friendSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  receiptScroll: { marginTop: 12, flexDirection: 'row' },
  receiptImage: { 
    width: 150, 
    height: 200, 
    borderRadius: 12, 
    marginRight: 12, 
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyReceiptBox: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    width: '100%'
  },
  emptyText: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  addReceiptBtn: {
    width: 150,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addReceiptText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '600'
  },
  roleContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // 针对安卓
  },
  roleLabel: { 
    fontSize: 11, 
    color: '#94a3b8', 
    fontWeight: 'bold', 
    marginTop: 12, 
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  ownerChip: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
  ownerText: { color: '#b45309', fontSize: 12, fontWeight: '600' },
  payerChip: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
  payerText: { color: '#15803d', fontSize: 12, fontWeight: '600' },
});