// app\user-report.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/themed-text';
import AppScreen from '../components/ui/AppScreen';
import AppTopBar from '../components/ui/AppTopBar';
import { auth } from '../services/firebase';
import { getUserGlobalStatsUrl } from '../services/statsManager';

const { width: screenWidth } = Dimensions.get('window');

export default function UserReportScreen() {
  // 💡 显式定义状态类型，防止 TypeScript 报错
  const [report, setReport] = useState<{ url: string; width: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyStats() {
      try {
        if (auth.currentUser) {
          const res = await getUserGlobalStatsUrl(auth.currentUser.uid);
          // 💡 强制类型转换，解决 'never' 报错
          if (res && typeof res === 'object') {
             setReport(res as { url: string; width: number });
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMyStats();
  }, []);

  return (
    <AppScreen>
      <AppTopBar title="My Spending Report" showBack onBackPress={() => router.back()} />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Personal Monthly Trends</ThemedText>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : report ? (
          <View style={styles.chartWrapper}>
            {/* 💡 横向滑动的 ScrollView */}
            <ScrollView 
              horizontal={true} 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ width: report.width }} // 💡 必须撑开内容区
            >
              <Image 
                source={{ uri: report.url }} 
                style={{
                  height: 350,
                  width: report.width, // 💡 强制图片宽度
                }}
                resizeMode="stretch" // 💡 绝不能用 contain，必须用 stretch 强行铺开
              />
            </ScrollView>
          </View>
        ) : (
          <ThemedText style={{ textAlign: 'center' }}>No data found.</ThemedText>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: { padding: 20 },
  chartWrapper: {
    backgroundColor: '#fff',
    width: screenWidth, // 容器是屏幕宽
    height: 350,
  }
});