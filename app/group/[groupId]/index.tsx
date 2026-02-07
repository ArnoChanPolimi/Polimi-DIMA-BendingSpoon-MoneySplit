// app\group\[groupId]\index.tsx
import { auth, db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { arrayUnion, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// 1. 修改导入
import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';

type GroupDetail = {
  id: string;
  name: string;
  startDate: string;
  totalExpenses: number;
  status: 'ongoing' | 'finished';
  involvedFriends?: { uid: string; displayName: string }[]; // 因为在 QuickAdd 存的是这个字段
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

  // 1. 在组件内定义更新逻辑
  const handleAddMember = async (friend: { uid: string, displayName: string }) => {
    if (!groupId) return;
    try {
      const groupRef = doc(db, "groups", groupId);
      // 使用 arrayUnion 确保不会重复添加同一个好友
      await updateDoc(groupRef, {
        involvedFriends: arrayUnion(friend)
      });
      // 成功后，onSnapshot 会自动监听到变化并刷新胶囊列表
    } catch (error) {
      console.error("Add member error:", error);
      Alert.alert("Error", "Failed to add member.");
    }
  };

  useEffect(() => {
    if (!groupId) return;

    // --- 【优化 1：静态数据拦截】 ---
    // 逻辑：如果是系统自带展示账单，直接赋值并关闭 Loading，不往后走
    const staticGroup = MOCK_GROUPS_DATA[groupId];
    if (staticGroup) {
      console.log("System: Displaying demo bill.");
      setGroup(staticGroup);
      setExpenses([]); 
      setLoading(false); 
      return; // 核心：拦截，不让它去等 Firebase Auth
    }

    // --- 【逻辑 2：真数据加载】 ---
    const user = auth.currentUser;
    if (!user) {
      // 如果不是假数据且没登录，这里才是真卡住了
      return;
    }

    // 1. 监听账单详情
    const unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() } as GroupDetail);
      }
      setLoading(false);
    });

    // 2. 监听流水记录
    const unsubExpenses = onSnapshot(
      query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc")),
      (snap) => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[]);
      }
    );

    // 3. 监听好友列表 (用于 Add 按钮)
    const friendsRef = collection(db, "users", user.uid, "friends");
    const unsubFriends = onSnapshot(query(friendsRef, orderBy("displayName", "asc")), (snap) => {
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() })) as any;
      setAllFriends(list);
    });

    return () => {
      unsubGroup();
      unsubExpenses();
      unsubFriends();
    };
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
        <View style={styles.memberRow}>
          {/* 1. 循环渲染已加入成员的胶囊 */}
          {group.involvedFriends?.map((friend) => (
            <View key={friend.uid} style={styles.memberChip}>
              <View style={styles.miniAvatar}>
                <ThemedText style={styles.avatarText}>
                  {(friend.displayName || "U").charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={styles.chipText} numberOfLines={1}>
                {friend.displayName.length > 8 
                  ? `${friend.displayName.substring(0, 8)}...` 
                  : friend.displayName}
              </ThemedText>
            </View>
          ))}

          {/* 2. 把原先笨重的 Add 按钮也拍扁成胶囊形态 */}
          <Pressable 
            style={styles.addMemberChip} 
            onPress={() => setIsModalVisible(true)} // 改为打开弹窗
          >
            <Ionicons name="add" size={14} color="#6b7280" />
            <ThemedText style={styles.addMemberText}>Add</ThemedText>
          </Pressable>
        </View>
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
                  handleAddMember(friend);
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
});