// app\(tabs)\index.tsx
import { t } from '@/core/i18n';
import { useSettings } from '@/core/settings/SettingsContext';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  const { language } = useSettings();
  const [firebaseGroups, setFirebaseGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. 实时监听云端数据库
  // 新增状态：用于存储未读通知数量
  const [unreadCount, setUnreadCount] = useState(0);

  // 持有 unsubscribe 函数的引用，以便手动刷新时使用
  const unsubscribeGroupsRef = useRef<(() => void) | null>(null);
  const unsubscribeNotificationsRef = useRef<(() => void) | null>(null);

  // 设置 Firebase 监听器的通用函数
  const setupListeners = (user: any) => {
    // 清理之前的监听器
    if (unsubscribeGroupsRef.current) {
      unsubscribeGroupsRef.current();
    }
    if (unsubscribeNotificationsRef.current) {
      unsubscribeNotificationsRef.current();
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
      setIsRefreshing(false);
    }, (error) => {
      console.error("Groups sync error:", error);
      setLoading(false);
      setIsRefreshing(false);
    });

    unsubscribeGroupsRef.current = unsubscribeGroups;

    // --- [分支 B：未读消息/通知监听器] ---
    const notificationQuery = query(
      collection(db, "notifications"),
      where("to", "==", user.uid),
      where("status", "==", "unread")
    );

    const unsubscribeNotifications = onSnapshot(notificationQuery, (snapshot) => {
      console.log("New notifications received, count:", snapshot.docs.length);
      setUnreadCount(snapshot.size);
    }, (error) => {
      console.error("Notifications sync error:", error);
    });

    unsubscribeNotificationsRef.current = unsubscribeNotifications;
  };

  useEffect(() => {
    setLoading(true);

    // 1. 监听用户登录状态
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setFirebaseGroups([]);
        setUnreadCount(0);
        setLoading(false);
        // 清理监听器
        if (unsubscribeGroupsRef.current) {
          unsubscribeGroupsRef.current();
        }
        if (unsubscribeNotificationsRef.current) {
          unsubscribeNotificationsRef.current();
        }
        return;
      }

      setupListeners(user);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeGroupsRef.current) {
        unsubscribeGroupsRef.current();
      }
      if (unsubscribeNotificationsRef.current) {
        unsubscribeNotificationsRef.current();
      }
    };
  }, []);

  // 处理下拉刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const user = auth.currentUser;
    if (user) {
      setupListeners(user);
    }
    // 保证至少显示 500ms 的刷新动画
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // 4. 合并逻辑：如果有云端数据，只显示云端的；如果没有云端数据，显示假数据
  const allGroups = (!loading && firebaseGroups.length > 0)
    ? firebaseGroups 
    : (loading ? [] : Object.values(MOCK_GROUPS_DATA));

  return (
    <AppScreen
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
    >
      {/* 核心修改点：renderRight 必须写在组件标签内 */}
      <AppTopBar 
        title={t("myGroups")}
        showRefresh={true}
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
        renderRight={() => (
          <Pressable 
            onPress={() => router.push('/friends')} 
            style={styles.notificationBtn}
          >
            {/* 蓝色像素风加号 */}
            <View style={styles.pixelPlusContainer}>
              <View style={styles.pixelPlusHorizontal} />
              <View style={styles.pixelPlusVertical} />
            </View>
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
          {t("yourSharedBillGroups")}
        </ThemedText>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#2563eb" />
            <ThemedText style={{fontSize: 12, marginTop: 8}}>{t("syncingWithCloud")}</ThemedText>
          </View>
        )}

        {allGroups.map((group) => {
          // 1. 动脑子逻辑：给缺失字段设置"回退值"
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
                  {/* 像素风状态标签 */}
                  <View style={[
                    styles.statusPill, 
                    { 
                      backgroundColor: status === 'ongoing' ? '#fecaca' : '#e5e7eb',
                      borderColor: status === 'ongoing' ? '#ef4444' : '#9ca3af',
                    }
                  ]}>
                    <ThemedText style={[
                      styles.statusText, 
                      { color: status === 'ongoing' ? '#dc2626' : '#4b5563' }
                    ]}>
                      {(status === 'ongoing' ? t('notFinished') : t('finished')).toUpperCase()} 
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
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#60a5fa',
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'rgba(219, 234, 254, 0.7)',
    borderWidth: 0,
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
    borderRadius: 0,
    borderWidth: 2,
  },
  statusText: { 
    fontSize: 8, 
    fontFamily: 'PressStart2P_400Regular',
  },
  billId: { 
    fontSize: 10, 
    fontFamily: 'monospace', 
    opacity: 0.5,
    color: '#1f2937',
  },
  groupName: { 
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'baseline',
    marginTop: 12 
  },
  dateText: { 
    fontSize: 12, 
    opacity: 0.6,
    color: '#1f2937',
  },
  amountText: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#2563eb',
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
  },
  // 蓝色像素风加号样式
  pixelPlusContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pixelPlusHorizontal: {
    position: 'absolute',
    width: 18,
    height: 6,
    backgroundColor: '#2563eb',
    // 像素风：方角
  },
  pixelPlusVertical: {
    position: 'absolute',
    width: 6,
    height: 18,
    backgroundColor: '#2563eb',
    // 像素风：方角
  },
});
