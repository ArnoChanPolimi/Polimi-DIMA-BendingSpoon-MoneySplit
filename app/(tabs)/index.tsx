// app\(tabs)\index.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// 1. Firebase 核心引用
import { auth, db } from '@/services/firebase';
// 导入统一的假数据源
import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';
import { collection, onSnapshot, or, orderBy, query, where } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';

export default function GroupsScreen() {
  const [firebaseGroups, setFirebaseGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. 实时监听云端数据库
  // 新增状态：用于存储未读通知数量
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setLoading(true);

    // 1. 监听用户登录状态
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setFirebaseGroups([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      // --- [分支 A：群组数据监听器] ---
      const groupQuery = query(
        collection(db, "groups"),
        or(
          where("ownerId", "==", user.uid),
          where("participantIds", "array-contains", user.uid)
        ),
        orderBy("updatedAt", "desc") 
      );

      const unsubscribeGroups = onSnapshot(groupQuery, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFirebaseGroups(docs);
        setLoading(false);
      }, (error) => {
        console.error("Groups sync error:", error);
        setLoading(false);
      });

      // --- [分支 B：未读消息/通知监听器] ---
      // 逻辑：监听所有发给“我”且状态为“pending”的消息
      const notificationQuery = query(
        collection(db, "notifications"),
        where("to", "==", user.uid),
        where("status", "==", "pending")
      );

      const unsubscribeNotifications = onSnapshot(notificationQuery, (snapshot) => {
        console.log("New notifications received, count:", snapshot.docs.length);
        setUnreadCount(snapshot.docs.length);
      }, (error) => {
        console.error("Notifications sync error:", error);
      });

      // 返回清理函数：当用户注销或身份改变时，同时杀掉两个监听器
      return () => {
        unsubscribeGroups();
        unsubscribeNotifications();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  // 4. 合并逻辑：如果有云端数据，只显示云端的；如果没有云端数据，显示假数据
  const allGroups = (!loading && firebaseGroups.length > 0)
    ? firebaseGroups 
    : (loading ? [] : Object.values(MOCK_GROUPS_DATA));

  return (
    <AppScreen>
      {/* 核心修改点：renderRight 必须写在组件标签内 */}
      <AppTopBar 
        title="My Expenses" 
        renderRight={() => (
          <Pressable 
            onPress={() => router.push('/friends')} 
            style={styles.notificationBtn}
          >
            <ThemedText style={{ fontSize: 24 }}>🔔</ThemedText> 
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
              </View>
            )}
          </Pressable>
        )}
      />
          
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
  },
  notificationBtn: {
    padding: 4,
    position: 'relative', // 必须有，否则红点定位会乱
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff', // 白边让红点更醒目
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});