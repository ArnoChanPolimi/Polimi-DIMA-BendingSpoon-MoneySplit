// // services\statsManager.ts
// /**
//  * 修改文件：services/statsManager.ts
//  * 逻辑：直接从群组文档的 involvedFriends 数组中提取该用户的 claimedAmount
//  */
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { Dimensions } from 'react-native';
// import { generateMonthlyBarChartUrl } from './external/quickChart';
// import { db } from './firebase';
// // 💡 别忘了增加这两个持久化函数，否则 UI 重启就重置了
// import AsyncStorage from '@react-native-async-storage/async-storage';
// export const getMonthlyLimit = async () => {
//   const val = await AsyncStorage.getItem('@budget_limit');
//   return val ? parseFloat(val) : 2000;
// };
// export const saveMonthlyLimit = async (val: string) => {
//   await AsyncStorage.setItem('@budget_limit', val);
// };

// // 获取屏幕宽度，用于动态计算图表总宽度
// const { width: screenWidth } = Dimensions.get('window');

// /**
//  * 获取用户全局消费统计图表 URL
//  * 逻辑：补全月份、动态配色、支持滑动查看
//  */
// export const getUserGlobalStatsUrl = async (userId: string, limit: number = 2000) => { // 💡 必须在这里接收 limit
//   try {
//     const groupsRef = collection(db, 'groups');
//     const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
//     const groupSnap = await getDocs(qGroups);
//     const monthlyTotals: { [key: string]: number } = {};

//     groupSnap.forEach(doc => {
//       const data = doc.data();
//       const myRecord = data.involvedFriends?.find((f: any) => f.uid === userId);
//       if (myRecord && myRecord.claimedAmount && data.startDate) {
//         const monthKey = data.startDate.substring(0, 7);
//         monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(myRecord.claimedAmount);
//       }
//     });

//     const sortedMonths = Object.keys(monthlyTotals).sort();
//     if (sortedMonths.length === 0) return null;

//     const labels: string[] = [];
//     const dataPoints: number[] = [];
//     const start = new Date(sortedMonths[0] + "-01");
//     const end = new Date();
//     const currentMonthStr = end.toISOString().substring(0, 7);

//     let iterDate = new Date(start);
//     while (iterDate <= end) {
//       const key = iterDate.toISOString().substring(0, 7);
//       labels.push(key);
//       dataPoints.push(monthlyTotals[key] || 0);
//       iterDate.setMonth(iterDate.getMonth() + 1);
//     }

//     // ✅ 颜色区分逻辑：现在 limit 有定义了
//     const backgroundColors = labels.map((m, index) => {
//       const isOverLimit = dataPoints[index] > limit; 
//       if (isOverLimit) return '#FF4444'; // 超额红色
//       return m === currentMonthStr ? '#4ADE80' : '#CBD5E1'; 
//     });

//     const textColors = labels.map((m, index) => 
//       dataPoints[index] > limit ? '#991B1B' : (m === currentMonthStr ? '#166534' : '#475569')
//     );

//     const paddingSpace = 100; 
//     const dynamicWidth = Math.max(screenWidth, labels.length * 100) + paddingSpace;

//     const url = generateMonthlyBarChartUrl(
//         labels, 
//         dataPoints, 
//         dynamicWidth, 
//         backgroundColors, 
//         textColors
//     );

//     return { url, width: dynamicWidth, count: labels.length };
//   } catch (error) {
//     console.error("Stats Error:", error);
//     return null;
//   }
// };

// /**
//  * 专门获取当前用户【本月】的认领总额
//  */
// export const getCurrentMonthSpend = async (userId: string) => {
//   try {
//     const currentMonth = new Date().toISOString().substring(0, 7); // 得到 "2026-02"
//     const groupsRef = collection(db, 'groups');
//     const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
//     const groupSnap = await getDocs(qGroups);
    
//     let total = 0;

//     groupSnap.forEach(doc => {
//       const data = doc.data();
//       // 只算本月的账单
//       if (data.startDate && data.startDate.startsWith(currentMonth)) {
//         const myRecord = data.involvedFriends?.find((f: any) => f.uid === userId);
//         if (myRecord && myRecord.claimedAmount) {
//           total += parseFloat(myRecord.claimedAmount) || 0;
//         }
//       }
//     });

//     return total;
//   } catch (error) {
//     console.error("Fetch current month spend error:", error);
//     return 0;
//   }
// };

// services/statsManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Dimensions } from 'react-native';
import { generateMonthlyBarChartUrl } from './external/quickChart';
import { db } from './firebase';

export const getMonthlyLimit = async () => {
  const val = await AsyncStorage.getItem('@budget_limit');
  return val ? parseFloat(val) : 2000;
};

export const saveMonthlyLimit = async (val: string) => {
  await AsyncStorage.setItem('@budget_limit', val);
};

const { width: screenWidth } = Dimensions.get('window');

export const getUserGlobalStatsUrl = async (userId: string, limit: number = 2000) => {
  try {
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    const groupSnap = await getDocs(qGroups);
    const monthlyTotals: { [key: string]: number } = {};

    // ✨ 用于存储本月真实的消费总额，供封面显示
    let thisMonthTotal = 0;

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
    const safeData: number[] = [];
    const excessData: (number | null)[] = []; 
    const bgColorsSafe: string[] = [];
    const bgColorsExcess: string[] = [];

    const now = new Date();
    // 保证 currentMonthStr 格式为 "YYYY-MM"
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const start = new Date(sortedMonths[0] + "-01");
    const end = new Date();
    let iterDate = new Date(start);

    while (iterDate <= end) {
      const key = iterDate.toISOString().substring(0, 7);
      const total = monthlyTotals[key] || 0;
      labels.push(key);

      if (key === currentMonthStr) {
        // ✅ 记录本月总额，供页面展示
        thisMonthTotal = total;

        if (total > limit) {
          safeData.push(limit);
          excessData.push(total - limit);
          bgColorsSafe.push('#07C160');   // 微信绿
          bgColorsExcess.push('#FA5151'); // 微信红
        } else {
          safeData.push(total);
          excessData.push(0); 
          bgColorsSafe.push('#07C160');
          bgColorsExcess.push('transparent');
        }
      } else {
        // ❌ 历史月份：淡色处理
        safeData.push(total);
        excessData.push(null); 
        bgColorsSafe.push('#C6F6D5'); 
        bgColorsExcess.push('transparent');
      }
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    // 🔥 【核心修复】：计算每一根柱子的真实物理总高度
    // 之前失败是因为只对比了分层数值，没算堆叠后的总和
    const barTotalHeights = labels.map((_, i) => {
      const base = safeData[i] || 0;
      const extra = Number(excessData[i]) || 0; 
      return base + extra; 
    });

    // 取所有柱子中的最高值（且不低于 limit）
    const maxValue = Math.max(...barTotalHeights, limit);

    const dynamicWidth = Math.max(screenWidth, labels.length * 80) + 100;
    
    const url = generateMonthlyBarChartUrl(
      labels,
      safeData,
      excessData,
      limit,
      dynamicWidth,
      bgColorsSafe,
      bgColorsExcess,
      maxValue // ✨ 将算对的总高度传给 URL 生成器
    );

    return { 
      url, 
      width: dynamicWidth, 
      count: labels.length,
      thisMonthTotal 
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
};