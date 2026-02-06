// app\(tabs)\index.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// 1. Firebase 核心引用
import { db } from '@/services/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';

// 2. 合理的假数据：编号格式已统一为 GB-xxxx
const DEMO_GROUPS = [
  { 
    id: 'GB-20220412-X9P2', 
    name: 'Paris Trip 2022', 
    totalExpenses: 260.0, 
    status: 'finished',
    startDate: '2022-04-12'
  },
  { 
    id: 'GB-20230101-R4T7', 
    name: 'Roommates Bills', 
    totalExpenses: 1520.0, 
    status: 'ongoing',
    startDate: '2023-01-01'
  }
];

export default function GroupsScreen() {
  const [firebaseGroups, setFirebaseGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. 实时监听云端数据库
  useEffect(() => {
    // 监听 groups 集合，按 updatedAt 倒序排列（新生成的在前）
    const q = query(collection(db, "groups"), orderBy("updatedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setFirebaseGroups(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // 页面销毁时取消监听，省电省流量
  }, []);

  // 4. 合并数据源：真数据 + 假数据
  const allGroups = [...firebaseGroups, ...DEMO_GROUPS];

  return (
    <AppScreen>
      <AppTopBar title="My Expenses" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText style={styles.subtitle}>
          Your shared bill groups and history.
        </ThemedText>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#2563eb" />
            <ThemedText style={{fontSize: 12, marginTop: 8}}>Syncing with cloud...</ThemedText>
          </View>
        )}

        {allGroups.map((group) => {
          // 1. 动脑子逻辑：给缺失字段设置“回退值”
          const status = group?.status || 'ongoing'; // 如果没有 status，默认显示 ongoing
          const safeExpenses = group?.totalExpenses || 0; // 如果没有金额，显示 0
          const displayDate = group?.startDate || (group?.updatedAt ? new Date(group.updatedAt).toLocaleDateString() : 'Unknown');

          return (
            <Pressable 
              key={group.id} 
              onPress={() => router.push(`/group/${group.id}`)}
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
            >
              <ThemedView style={styles.cardContent}>
                <View style={styles.cardTop}>
                  {/* 修正：安全调用 toUpperCase */}
                  <View style={[
                    styles.statusPill, 
                    { backgroundColor: status === 'ongoing' ? '#fee2e2' : '#f3f4f6' }
                  ]}>
                    <ThemedText style={[
                      styles.statusText, 
                      { color: status === 'ongoing' ? '#ef4444' : '#6b7280' }
                    ]}>
                      ● {status.toUpperCase()} 
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.billId}>{group.id}</ThemedText>
                </View>

                <ThemedText type="defaultSemiBold" style={styles.groupName}>
                  {group.name || 'Unnamed Group'}
                </ThemedText>

                <View style={styles.cardBottom}>
                  <ThemedText style={styles.dateText}>Started {displayDate}</ThemedText>
                  <ThemedText style={styles.amountText}>
                    {/* 修正：安全调用 toFixed */}
                    {Number(safeExpenses).toFixed(2)} €
                  </ThemedText>
                </View>
              </ThemedView>
            </Pressable>
          );
        })}

        {/* 底部留白，防止被 Tab Bar 遮挡 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16 },
  subtitle: { marginBottom: 20, opacity: 0.6, fontSize: 14 },
  loader: { padding: 20, alignItems: 'center' },
  card: { 
    marginBottom: 16, 
    borderRadius: 16, 
    overflow: 'hidden',
    elevation: 2, // 安卓阴影
    shadowColor: '#000', // iOS 阴影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  statusPill: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  statusText: { 
    fontSize: 9, 
    fontWeight: 'bold' 
  },
  billId: { 
    fontSize: 10, 
    fontFamily: 'monospace', 
    opacity: 0.4 
  },
  groupName: { 
    fontSize: 18,
    color: '#1f2937'
  },
  cardBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'baseline',
    marginTop: 12 
  },
  dateText: { 
    fontSize: 12, 
    opacity: 0.5 
  },
  amountText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#2563eb' 
  }
});