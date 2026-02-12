import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '../components/themed-text';
import AppScreen from '../components/ui/AppScreen';
import AppTopBar from '../components/ui/AppTopBar';

import { t } from '../core/i18n';
import { auth } from '../services/firebase';
import {
    getCurrentMonthLimit,
    saveMonthlyLimit,
    subscribeToUserStats,
} from '../services/statsManager';

export default function UserReportScreen() {
  const [report, setReport] = useState<{
    url: string;
    width: number;
    count?: number;
    thisMonthTotal?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [tempLimit, setTempLimit] = useState('');

  // 初始化：从 Firebase 读取当前用户当前月份的限额
  useEffect(() => {
    if (!auth.currentUser) {
      setMonthlyLimit(0);
      return;
    }
    getCurrentMonthLimit(auth.currentUser.uid).then((val) => {
      setMonthlyLimit(val);
    });
  }, []);

  // 订阅实时统计
  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);
    const unsubscribe = subscribeToUserStats(
      auth.currentUser.uid,
      monthlyLimit,
      (data) => {
        setReport(data);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [monthlyLimit]);

  const handleEditLimit = () => {
    setTempLimit(monthlyLimit.toString());
    setModalVisible(true);
  };

  // ✅ 修复：确保 userId 存在再调用 saveMonthlyLimit
  const confirmLimit = () => {
    let num = parseFloat(tempLimit);
    if (tempLimit === '' || isNaN(num)) num = 0;

    const userId = auth.currentUser?.uid;
    if (userId) {
      saveMonthlyLimit(num.toString(), userId);
      setMonthlyLimit(num);
    }

    setModalVisible(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLoading(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const CustomLegend = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, paddingTop: 15, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 12, height: 12, backgroundColor: '#2563eb' }} />
        <ThemedText style={{ fontSize: 12, fontWeight: 'bold' }}>Within Budget</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 12, height: 12, backgroundColor: '#ef4444' }} />
        <ThemedText style={{ fontSize: 12, fontWeight: 'bold' }}>Excess Amount</ThemedText>
      </View>
    </View>
  );

  return (
    <AppScreen>
      <AppTopBar
        title="My Spending Report"
        showBack
        showRefresh
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
        onBackPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />

      {/* 限额展示 */}
      <View style={{ zIndex: 10, paddingHorizontal: 16, paddingTop: 12 }}>
        <TouchableOpacity activeOpacity={0.6} onPress={handleEditLimit} style={styles.limitHeader}>
          <ThemedText style={styles.limitLabel}>{t('monthlyLimit')}</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ThemedText style={styles.limitValue}>€{Math.round(monthlyLimit)}</ThemedText>
            <View style={styles.pixelEditIcon}>
              <ThemedText style={{ fontSize: 10, fontWeight: 'bold', color: '#007AFF' }}>✎</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Personal Monthly Trends</ThemedText>
        </View>

        {!auth.currentUser ? (
          <View style={styles.placeholderWrapper}>
            <ThemedText style={{ fontSize: 16, color: '#999', textAlign: 'center' }}>Please log in</ThemedText>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : report ? (
          <View style={styles.chartWrapper}>
            <CustomLegend />
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <Image
                source={{ uri: report.url }}
                style={{ height: 300, width: Math.max(report?.width || 0, 800) }}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        ) : (
          <ThemedText style={{ textAlign: 'center' }}>No data found.</ThemedText>
        )}
      </ScrollView>

      {/* 修改限额弹窗 */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ThemedText style={styles.modalTitle}>{t('monthlyLimit')}</ThemedText>
            <TextInput
              style={styles.input}
              value={tempLimit}
              onChangeText={setTempLimit}
              keyboardType="numeric"
              autoFocus
              placeholder="0"
              placeholderTextColor="#ccc"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <ThemedText style={{ color: '#666' }}>{t('cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLimit} style={styles.btnConfirm}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>{t('done')}</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: { padding: 20 },
  chartWrapper: {
    backgroundColor: '#fff',
    height: 360,
    borderRadius: 0,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  placeholderWrapper: {
    backgroundColor: '#fff',
    height: 360,
    borderRadius: 0,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitHeader: {
    padding: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  limitLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  limitValue: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  pixelEditIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#007AFF',
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#007AFF' },
  input: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 0,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
    backgroundColor: '#fff',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  btnCancel: { flex: 1, alignItems: 'center', padding: 12, borderWidth: 2, borderColor: '#ccc', borderRadius: 0 },
  btnConfirm: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#007AFF', borderRadius: 0, borderWidth: 2, borderColor: '#007AFF' },
});