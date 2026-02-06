// app\group\[groupId]\index.tsx
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';

// 【修改点 1】为了防止点假账单报错，必须在这里也定义一份匹配的字典
const DEMO_GROUPS_DATA: Record<string, any> = {
  'GB-20220412-X9P2': { 
    id: 'GB-20220412-X9P2', 
    name: 'Paris Trip 2022', 
    startDate: '2022-04-12', 
    totalExpenses: 260.00, 
    status: 'finished' 
  },
  'GB-20230101-R4T7': { 
    id: 'GB-20230101-R4T7', 
    name: 'Roommates Bills', 
    startDate: '2023-01-01', 
    totalExpenses: 1520.00, 
    status: 'ongoing' 
  }
};

type GroupDetail = {
  id: string;
  name: string;
  startDate: string;
  totalExpenses: number;
  status: 'ongoing' | 'finished';
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

  useEffect(() => {
    if (!groupId) return;

    // 【修改点 2】如果是点击的假账单，直接加载本地数据并退出
    if (DEMO_GROUPS_DATA[groupId]) {
      setGroup(DEMO_GROUPS_DATA[groupId]);
      setExpenses([]); // 假数据没有流水，设为空
      setLoading(false);
      return; 
    }

    // 真数据逻辑：实时监听 Firestore
    const groupRef = doc(db, "groups", groupId);
    const unsubGroup = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        setGroup({ id: docSnap.id, ...docSnap.data() } as GroupDetail);
      }
      setLoading(false);
    });

    const expensesRef = collection(db, "groups", groupId, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"));
    const unsubExpenses = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[];
      setExpenses(list);
    });

    return () => {
      unsubGroup();
      unsubExpenses();
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

        <ThemedText type="subtitle" style={styles.sectionTitle}>Manage Group</ThemedText>
        <ThemedView style={styles.inviteCard}>
          <View style={styles.inviteButtonsRow}>
            <Pressable style={styles.actionButton} onPress={() => Alert.alert("Invite ID", group.id)}>
              <Ionicons name="person-add-outline" size={16} color="#2563eb" />
              <ThemedText style={styles.actionText}>Add Member</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => Alert.alert("QR Join", `Data: ${group.id}`)}>
              <Ionicons name="qr-code-outline" size={16} color="#2563eb" />
              <ThemedText style={styles.actionText}>Group QR</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerCard: { padding: 24, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', marginVertical: 16 },
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
  actionText: { fontSize: 13, color: '#2563eb', fontWeight: '600' }
});