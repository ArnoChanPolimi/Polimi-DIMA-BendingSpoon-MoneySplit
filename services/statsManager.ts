// services\statsManager.ts
/**
 * 修改文件：services/statsManager.ts
 * 逻辑：直接从群组文档的 involvedFriends 数组中提取该用户的 claimedAmount
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Dimensions } from 'react-native';
import { generateMonthlyBarChartUrl } from './external/quickChart';
import { db } from './firebase';

// 获取屏幕宽度，用于动态计算图表总宽度
const { width: screenWidth } = Dimensions.get('window');

/**
 * 获取用户全局消费统计图表 URL
 * 逻辑：补全月份、动态配色、支持滑动查看
 */
export const getUserGlobalStatsUrl = async (userId: string) => {
  try {
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    const groupSnap = await getDocs(qGroups);
    const monthlyTotals: { [key: string]: number } = {};

    groupSnap.forEach(doc => {
      const data = doc.data();
      const myRecord = data.involvedFriends?.find((f: any) => f.uid === userId);
      if (myRecord && myRecord.claimedAmount && data.startDate) {
        const monthKey = data.startDate.substring(0, 7);
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(myRecord.claimedAmount);
      }
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    if (sortedMonths.length === 0) return null;

    const labels: string[] = [];
    const dataPoints: number[] = [];
    const start = new Date(sortedMonths[0] + "-01");
    const end = new Date();
    const currentMonthStr = end.toISOString().substring(0, 7);

    let iterDate = new Date(start);
    while (iterDate <= end) {
      const key = iterDate.toISOString().substring(0, 7);
      labels.push(key);
      dataPoints.push(monthlyTotals[key] || 0);
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    // 💡 颜色区分逻辑
    const backgroundColors = labels.map(m => 
      m === currentMonthStr ? '#4ADE80' : '#CBD5E1' // 当月纯绿，过去灰绿
    );
    const textColors = labels.map(m => 
      m === currentMonthStr ? '#166534' : '#475569' // 对应深色文字
    );

    // 💡 锁定滑动：每月占 100px
    // 💡 左右各留 50px 的安全区，防止滑到头或滑到尾时柱子贴墙
    const paddingSpace = 100; 
    const dynamicWidth = Math.max(screenWidth, labels.length * 100) + paddingSpace;

    const url = generateMonthlyBarChartUrl(
        labels, 
        dataPoints, 
        dynamicWidth, 
        backgroundColors, 
        textColors
    );

    // ✅ 这里的 return 与上面的 Promise 类型定义完美契合
    return { url, width: dynamicWidth, count: labels.length };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
};
/**
 * 专门获取当前用户【本月】的认领总额
 */
export const getCurrentMonthSpend = async (userId: string) => {
  try {
    const currentMonth = new Date().toISOString().substring(0, 7); // 得到 "2026-02"
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    const groupSnap = await getDocs(qGroups);
    
    let total = 0;

    groupSnap.forEach(doc => {
      const data = doc.data();
      // 只算本月的账单
      if (data.startDate && data.startDate.startsWith(currentMonth)) {
        const myRecord = data.involvedFriends?.find((f: any) => f.uid === userId);
        if (myRecord && myRecord.claimedAmount) {
          total += parseFloat(myRecord.claimedAmount) || 0;
        }
      }
    });

    return total;
  } catch (error) {
    console.error("Fetch current month spend error:", error);
    return 0;
  }
};