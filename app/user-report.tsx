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
    Dimensions,
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
    getUserGlobalStatsUrl,
    saveMonthlyLimit
} from '../services/statsManager';

const { width: screenWidth } = Dimensions.get('window');

export default function UserReportScreen() {
    const [report, setReport] = useState<{ url: string; width: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [monthlyLimit, setMonthlyLimit] = useState(2000); 

    // ✨ 控制自定义弹窗的状态
    const [isModalVisible, setModalVisible] = useState(false);
    const [tempLimit, setTempLimit] = useState('');

    useEffect(() => {
        getMonthlyLimit().then(val => setMonthlyLimit(val));
    }, []);

    useEffect(() => {
        async function fetchMyStats() {
            setLoading(true);
            try {
                if (auth.currentUser) {
                    const res = await getUserGlobalStatsUrl(auth.currentUser.uid, monthlyLimit);
                    if (res) setReport(res as { url: string; width: number });
                }
            } finally {
                setLoading(false);
            }
        }
        fetchMyStats();
    }, [monthlyLimit]);

    // ✨ 统一修改限额的入口
    const handleEditLimit = () => {
        setTempLimit(monthlyLimit.toString());
        setModalVisible(true);
    };

    // ✨ 保存逻辑
    const confirmLimit = () => {
        const num = parseFloat(tempLimit);
        if (!isNaN(num) && num > 0) {
            setMonthlyLimit(num);
            saveMonthlyLimit(tempLimit);
            setModalVisible(false);
        }
    };

    return (
        <AppScreen>
            <AppTopBar title="My Spending Report" showBack
            onBackPress={() => {
                if (router.canGoBack()) {
                router.back();
                } else {
                router.replace('/'); // 如果没法返回（比如刷新了网页），就回首页
                }
            }} 
            />
            
            <View style={{ zIndex: 10, backgroundColor: '#f8f9fa' }}>
                <TouchableOpacity 
                    activeOpacity={0.6}
                    onPress={handleEditLimit} 
                    style={styles.limitHeader}
                >
                    <ThemedText style={styles.limitLabel}>{t('monthlyLimit')}</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ThemedText style={styles.limitValue}>${monthlyLimit}</ThemedText>
                        <ThemedText style={{ fontSize: 18, color: '#007AFF', marginLeft: 8 }}>✎</ThemedText>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="subtitle">Personal Monthly Trends</ThemedText>
                </View>

                {loading ? (
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
                            placeholder="e.g. 2000"
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
    chartWrapper: { backgroundColor: '#fff', height: 350 },
    limitHeader: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        backgroundColor: '#f8f9fa', 
    },
    limitLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
    limitValue: { fontSize: 24, fontWeight: 'bold' },
    // Modal 样式
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        fontSize: 18,
        marginBottom: 24,
        textAlign: 'center'
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    btnCancel: { flex: 1, alignItems: 'center', padding: 12 },
    btnConfirm: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#007AFF', borderRadius: 8 },
});