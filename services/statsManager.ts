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
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
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

/**
 * 获取当前用户本月的消费总额
 */
export const getCurrentMonthSpend = async (userId: string): Promise<number> => {
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

/**
 * 实时监听用户的统计数据变化
 * 返回 unsubscribe 函数用于清理监听
 * 
 * 核心逻辑：
 * 1. 查询用户参与的所有 groups
 * 2. 对每个 group 的 expenses 子集合进行监听
 * 3. 从每个 expense 的 splits[userId] 读取实际支出
 * 4. 支持多币种：非 EUR 的金额需要转换为 EUR
 * 5. 按月份聚合，生成图表
 */
export const subscribeToUserStats = (
  userId: string,
  limit: number,
  onUpdate: (data: { url: string; width: number; count: number; thisMonthTotal: number } | null) => void
): (() => void) => {
  try {
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    
    // 用来存储所有的 expense 监听器，以便清理
    const expenseUnsubscribers: (() => void)[] = [];
    // 用来存储每个 group 的月份数据
    const groupMonthlyData: { [groupId: string]: { [month: string]: number } } = {};
    
    const generateChartFromAllGroups = () => {
      const monthlyTotals: { [key: string]: number } = {};
      let thisMonthTotal = 0;
      
      // 合并所有 groups 的月份数据
      Object.values(groupMonthlyData).forEach(groupData => {
        Object.entries(groupData).forEach(([month, amount]) => {
          monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
        });
      });
      
      const sortedMonths = Object.keys(monthlyTotals).sort();
      if (sortedMonths.length === 0) {
        onUpdate(null);
        return;
      }

      const labels: string[] = [];
      const safeData: number[] = [];
      const excessData: (number | null)[] = [];
      const bgColorsSafe: string[] = [];
      const bgColorsExcess: string[] = [];

      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 🔑 固定显示3个月：当前月 + 前2个月
      const monthsToShow = 3;
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const total = Math.round(monthlyTotals[key] || 0);
        labels.push(key);

        if (key === currentMonthStr) {
          thisMonthTotal = total;

          if (total > limit) {
            safeData.push(Math.round(limit));
            excessData.push(Math.round(total - limit));
            bgColorsSafe.push('#2563eb');
            bgColorsExcess.push('#FA5151');
          } else {
            safeData.push(total);
            excessData.push(null);
            bgColorsSafe.push('#2563eb');
            bgColorsExcess.push('transparent');
          }
        } else {
          safeData.push(total);
          excessData.push(null);
          bgColorsSafe.push('#93c5fd');
          bgColorsExcess.push('transparent');
        }
      }

      const barTotalHeights = labels.map((_, i) => {
        const base = safeData[i] || 0;
        const extra = Number(excessData[i]) || 0;
        return base + extra;
      });

      const maxValue = Math.max(...barTotalHeights, Math.round(limit));
      // 固定宽度，6个月刚好适合屏幕
      const dynamicWidth = Math.max(screenWidth - 32, 350);

      const url = generateMonthlyBarChartUrl(
        labels,
        safeData,
        excessData,
        Math.round(limit),
        dynamicWidth,
        bgColorsSafe,
        bgColorsExcess,
        maxValue
      );

      onUpdate({
        url,
        width: dynamicWidth,
        count: labels.length,
        thisMonthTotal
      });
    };
    
    // 主 groups 监听器
    const groupUnsubscribe = onSnapshot(qGroups, async (groupSnap) => {
      // 清理旧的 expense 监听器
      expenseUnsubscribers.forEach(u => u());
      expenseUnsubscribers.length = 0;
      groupMonthlyData.length = 0;

      // 为每个 group 创建 expense 监听器
      for (const groupDoc of groupSnap.docs) {
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;
        
        // 🔑 获取 group 的 startDate 作为所有 expense 的月份
        const groupStartDate = groupData.startDate; // 格式: "YYYY-MM-DD"
        const groupMonthKey = groupStartDate ? groupStartDate.substring(0, 7) : null; // 格式: "YYYY-MM"
        
        groupMonthlyData[groupId] = {};
        
        const expensesRef = collection(db, 'groups', groupId, 'expenses');
        const expenseUnsubscribe = onSnapshot(expensesRef, async (expenseSnap) => {
          // 计算这个 group 的所有月份数据
          const newMonthlyTotals: { [key: string]: number } = {};
          
          for (const expenseDoc of expenseSnap.docs) {
            const expenseData = expenseDoc.data();
            const userSplitAmount = expenseData.splits?.[userId] || 0;
            
            if (userSplitAmount > 0 && groupMonthKey) {
              // 🔑 所有 expense 使用 group 的 startDate 月份
              const monthKey = groupMonthKey;
              
              // 支持多币种转换
              let amountInBase = userSplitAmount;
              if (expenseData.currency && expenseData.currency !== 'EUR') {
                try {
                  const { convertCurrency } = await import('./exchangeRateApi');
                  const conversionResult = await convertCurrency(
                    userSplitAmount,
                    expenseData.currency,
                    'EUR'
                  );
                  if (conversionResult?.success) {
                    amountInBase = conversionResult.convertedAmount;
                  }
                } catch (err) {
                  console.warn(`Currency conversion failed for ${expenseData.currency}:`, err);
                }
              }
              
              newMonthlyTotals[monthKey] = (newMonthlyTotals[monthKey] || 0) + amountInBase;
            }
          }
          
          // 更新这个 group 的数据
          groupMonthlyData[groupId] = newMonthlyTotals;
          
          // 触发图表重新生成
          generateChartFromAllGroups();
        });
        
        expenseUnsubscribers.push(expenseUnsubscribe);
      }
    }, (error) => {
      console.error("Stats subscription error:", error);
      onUpdate(null);
    });

    return () => {
      groupUnsubscribe();
      expenseUnsubscribers.forEach(u => u());
    };
  } catch (error) {
    console.error("Failed to subscribe to stats:", error);
    return () => {};
  }
};