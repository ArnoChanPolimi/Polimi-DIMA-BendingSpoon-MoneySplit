// // app\user-report.tsx
// import { router } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
// import { ThemedText } from '../components/themed-text';
// import AppScreen from '../components/ui/AppScreen';
// import AppTopBar from '../components/ui/AppTopBar';
// import { auth } from '../services/firebase';
// import { getUserGlobalStatsUrl } from '../services/statsManager';

// const { width: screenWidth } = Dimensions.get('window');

// export default function UserReportScreen() {
//   // 💡 显式定义状态类型，防止 TypeScript 报错
//   const [report, setReport] = useState<{ url: string; width: number } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchMyStats() {
//       try {
//         if (auth.currentUser) {
//           const res = await getUserGlobalStatsUrl(auth.currentUser.uid);
//           // 💡 强制类型转换，解决 'never' 报错
//           if (res && typeof res === 'object') {
//              setReport(res as { url: string; width: number });
//           }
//         }
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchMyStats();
//   }, []);

//   return (
//     <AppScreen>
//       <AppTopBar title="My Spending Report" showBack onBackPress={() => router.back()} />
      
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.header}>
//           <ThemedText type="subtitle">Personal Monthly Trends</ThemedText>
//         </View>

//         {loading ? (
//           <ActivityIndicator size="large" style={{ marginTop: 50 }} />
//         ) : report ? (
//           <View style={styles.chartWrapper}>
//             {/* 💡 横向滑动的 ScrollView */}
//             <ScrollView 
//               horizontal={true} 
//               showsHorizontalScrollIndicator={false}
//               bounces={true}                         // 增加滑到底部的回弹感
//               overScrollMode="never"                 // 防止 Android 出现奇怪的阴影
//               contentContainerStyle={{ width: report.width }} // 💡 必须撑开内容区
//             >
//               <Image 
//                 source={{ uri: report.url }} 
//                 style={{
//                   height: 350,
//                   width: report.width, // 💡 强制图片宽度
//                 }}
//                 resizeMode="stretch" // 💡 绝不能用 contain，必须用 stretch 强行铺开
//               />
//             </ScrollView>
//           </View>
//         ) : (
//           <ThemedText style={{ textAlign: 'center' }}>No data found.</ThemedText>
//         )}
//       </ScrollView>
//     </AppScreen>
//   );
// }

// const styles = StyleSheet.create({
//   container: { paddingBottom: 40 },
//   header: { padding: 20 },
//   chartWrapper: {
//     backgroundColor: '#fff',
//     width: screenWidth, // 容器是屏幕宽
//     height: 350,
//   }
// });


// app\user-report.tsx
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
    View
} from 'react-native';

import { ThemedText } from '../components/themed-text';
import AppScreen from '../components/ui/AppScreen';
import AppTopBar from '../components/ui/AppTopBar';

import { t } from '../core/i18n';
import { auth } from '../services/firebase';
import {
    getMonthlyLimit,
    saveMonthlyLimit,
    subscribeToUserStats
} from '../services/statsManager';

export default function UserReportScreen() {
    const [report, setReport] = useState<{ url: string; width: number; count?: number; thisMonthTotal?: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [monthlyLimit, setMonthlyLimit] = useState(0); 

    // ✨ 控制自定义弹窗的状态
    const [isModalVisible, setModalVisible] = useState(false);
    const [tempLimit, setTempLimit] = useState('');

    useEffect(() => {
        if (!auth.currentUser) {
            // 未登录时，限额显示为 0
            setMonthlyLimit(0);
            return;
        }
        
        // 已登录时，从本地存储获取限额
        getMonthlyLimit().then(val => setMonthlyLimit(val));
    }, []);

    useEffect(() => {
        if (!auth.currentUser) return;
        
        setLoading(true);
        // 使用实时监听替代 getUserGlobalStatsUrl
        const unsubscribe = subscribeToUserStats(
            auth.currentUser.uid,
            monthlyLimit,
            (data) => {
                setReport(data);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [monthlyLimit]);

    // ✨ 统一修改限额的入口
    const handleEditLimit = () => {
        setTempLimit(monthlyLimit.toString());
        setModalVisible(true);
    };

    // ✨ 保存逻辑
    const confirmLimit = () => {
        let num = parseFloat(tempLimit);
        
        // 如果输入为空，使用 0
        if (tempLimit === '' || isNaN(num)) {
            num = 0;
        }
        
        // 保存数值
        setMonthlyLimit(num);
        saveMonthlyLimit(num.toString());
        setModalVisible(false);
    };

    // 🔄 刷新数据
    const handleRefresh = () => {
        setIsRefreshing(true);
        // 重新订阅数据，会自动触发更新
        setLoading(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    return (
        <AppScreen>
            <AppTopBar 
                title="My Spending Report" 
                showBack
                showRefresh={true}
                onRefreshPress={handleRefresh}
                isRefreshing={isRefreshing}
                onBackPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/');
                    }
                }} 
            />
            
            <View style={{ zIndex: 10, paddingHorizontal: 16, paddingTop: 12 }}>
                <TouchableOpacity 
                    activeOpacity={0.6}
                    onPress={handleEditLimit} 
                    style={styles.limitHeader}
                >
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <Image 
                                source={{ uri: report.url }} 
                                style={{ height: 350, width: report.width }}
                                resizeMode="stretch"
                            />
                        </ScrollView>
                    </View>
                ) : (
                    <ThemedText style={{ textAlign: 'center' }}>No data found.</ThemedText>
                )}
            </ScrollView>

            {/* ✨ 全平台通用 Modal：安卓、iOS、网页都能跑 */}
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
    chartWrapper: { backgroundColor: '#fff', height: 360, borderRadius: 0, overflow: 'hidden', marginHorizontal: 16, marginVertical: 12, borderWidth: 2, borderColor: '#007AFF' },
    placeholderWrapper: { backgroundColor: '#fff', height: 360, borderRadius: 0, overflow: 'hidden', marginHorizontal: 16, marginVertical: 12, borderWidth: 2, borderColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
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
    // Modal 样式
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
        backgroundColor: '#fff'
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    btnCancel: { flex: 1, alignItems: 'center', padding: 12, borderWidth: 2, borderColor: '#ccc', borderRadius: 0 },
    btnConfirm: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#007AFF', borderRadius: 0, borderWidth: 2, borderColor: '#007AFF' },
});