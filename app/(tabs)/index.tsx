// app\(tabs)\index.tsx
import { useCurrency } from '@/core/currency/CurrencyContext';
import { t } from '@/core/i18n';
import { useSettings } from '@/core/settings/SettingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

// 1. Firebase 核心引用
import { auth, db } from '@/services/firebase';
import { subscribeToUserStats } from '@/services/statsManager';
// 导入统一的假数据源
import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';
import { collection, onSnapshot, or, orderBy, query, where } from 'firebase/firestore';

import { GroupCard } from '@/components/group/GroupCardWithListener';
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { Ionicons } from '@expo/vector-icons';


export default function GroupsScreen() {
  const { language, resolvedTheme } = useSettings();
  const { defaultCurrency, formatAmount } = useCurrency();
  const isDarkMode = resolvedTheme === 'dark';
  
  // 主题颜色
  const cardBgColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  
  const [firebaseGroups, setFirebaseGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. 实时监听云端数据库
  // 新增状态：用于存储未读通知数量
  const [unreadCount, setUnreadCount] = useState(0);
  // 新增：专门存本月总支出的状态
  const [thisMonthAmount, setThisMonthAmount] = useState(0);
  // 用于存储本月限额（用于 subscribeToUserStats）
  const [monthlyLimit, setMonthlyLimit] = useState(2000);

  // 持有 unsubscribe 函数的引用，以便手动刷新时使用
  const unsubscribeGroupsRef = useRef<(() => void) | null>(null);
  const unsubscribeNotificationsRef = useRef<(() => void) | null>(null);
  const unsubscribeStatsRef = useRef<(() => void) | null>(null);

  // 设置 Firebase 监听器的通用函数
  const setupListeners = (user: any) => {
    // 清理之前的监听器
    if (unsubscribeGroupsRef.current) {
      unsubscribeGroupsRef.current();
    }
    if (unsubscribeNotificationsRef.current) {
      unsubscribeNotificationsRef.current();
    }
    if (unsubscribeStatsRef.current) {
      unsubscribeStatsRef.current();
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

    // --- [分支 C：本月支出统计监听器] ---
    const unsubscribeStats = subscribeToUserStats(
      user.uid,
      monthlyLimit,
      (data) => {
        if (data) {
          setThisMonthAmount(data.thisMonthTotal);
        }
      }
    );

    unsubscribeStatsRef.current = unsubscribeStats;
  };

  useEffect(() => {
    setLoading(true);

    // 1. 监听用户登录状态
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setFirebaseGroups([]);
        setUnreadCount(0);
        setThisMonthAmount(0);
        setLoading(false);
        // 清理监听器
        if (unsubscribeGroupsRef.current) {
          unsubscribeGroupsRef.current();
        }
        if (unsubscribeNotificationsRef.current) {
          unsubscribeNotificationsRef.current();
        }
        if (unsubscribeStatsRef.current) {
          unsubscribeStatsRef.current();
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
      if (unsubscribeStatsRef.current) {
        unsubscribeStatsRef.current();
      }
    };
  }, [monthlyLimit]);

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
        {/* 个人消费统计仪表盘入口 - 适配主题 */}
        <Pressable 
          style={[
            styles.personalStatsCard,
            { 
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderWidth: 3,
              borderColor: isDarkMode ? '#60a5fa' : '#60a5fa',
              borderRadius: 0,
            }
          ]}
          onPress={() => router.push('/user-report')} 
        >
          <View style={styles.statsLeft}>
            <ThemedText style={[styles.statsSubtitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
              {t('mySpending')} ({t('thisMonth')})
            </ThemedText>
            {/* 数字使用普通字体，货币跟随设置 */}
            <ThemedText style={[styles.statsMainAmount, { color: isDarkMode ? '#f1f5f9' : '#0f172a', fontFamily: undefined }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatAmount(thisMonthAmount, defaultCurrency)}
            </ThemedText>
          </View>
          
          <View style={styles.statsRight}>
            <View style={[
              styles.chartCircle,
              { backgroundColor: isDarkMode ? '#1e3a5f' : '#eff6ff', borderRadius: 0 }
            ]}>
              <Ionicons name="trending-up" size={20} color="#60a5fa" />
            </View>
            <ThemedText style={[styles.viewDetailsText, { color: '#60a5fa' }]}>{t('viewTrends')}</ThemedText>
          </View>
        </Pressable>

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
          const displayDate = group?.startDate || (group?.updatedAt ? new Date(group.updatedAt).toLocaleDateString() : 'Unknown');

          // 2.【核心修正】控制金额展示
          const myUid = auth.currentUser?.uid;
          // 如果 group 文档里有 userTotalShares 这个 Map，就取我的那份
          // 如果没有（比如旧数据或假数据），才回退显示群组总额 group.totalExpenses
          const myPersonalShare = (myUid && group?.userTotalShares) 
            ? (group.userTotalShares[myUid] || 0) 
            : (group?.totalExpenses || 0);

          // 3. 将算好的个人金额赋值给 safeExpenses 传给子组件
          const safeExpenses = myPersonalShare;

          return (
            <GroupCard 
              key={group.id}
              group={group}
              status={status}
              safeExpenses={safeExpenses}
              displayDate={displayDate}
              onPress={() => router.push(`/group/${group.id}`)}
              onDelete={(groupId) => {
                // 群组删除后，Firestore 监听器会自动更新 allGroups 列表
                // 所以这里不需要手动处理，只是提供一个回调点
              }}
            />
          );
        })}

        {/* 底部留白，防止被 Tab Bar 遮挡 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 18 },
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
    marginBottom: 16 
  },
  statusPill: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 0,
    borderWidth: 2,
  },
  statusText: { 
    fontSize: 8, 
    // 注意：如果报字体错误，请确保已加载 PressStart2P
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
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
    position: 'relative',
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
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
  },
  pixelPlusVertical: {
    position: 'absolute',
    width: 6,
    height: 18,
    backgroundColor: '#2563eb',
  },

  // ✨ 补全下方缺失的样式 ✨
  personalStatsCard: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsLeft: {
    flex: 1,
    marginRight: 12,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  statsMainAmount: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  statsRight: {
    alignItems: 'center',
  },
  chartCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewDetailsText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '600',
  },
});
