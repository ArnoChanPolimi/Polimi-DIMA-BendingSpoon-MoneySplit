import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { Dimensions } from 'react-native';
import { generateMonthlyBarChartUrl } from './external/quickChart';
import { db } from './firebase';

// ---------- 本地存储：仅用作降级默认值 ----------
const DEFAULT_LIMIT = 2000;
const ASYNC_STORAGE_KEY = '@budget_limit';

/**
 * 获取当前用户当前月份的限额（优先从 Firebase 读取）
 */
export const getCurrentMonthLimit = async (userId: string): Promise<number> => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // ✅ 正确路径：users/{userId}/limits/{currentMonth}
    const limitRef = doc(db, 'users', userId, 'limits', currentMonth);
    const limitSnap = await getDoc(limitRef);
    
    if (limitSnap.exists()) {
      const limit = limitSnap.data().value;
      // 同步写入 AsyncStorage 作为备份
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY, limit.toString());
      return limit;
    }
  } catch (error) {
    console.warn('Failed to fetch current month limit from Firebase:', error);
  }
  
  // 降级：从 AsyncStorage 读取
  const val = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
  return val ? parseFloat(val) : DEFAULT_LIMIT;
};

/**
 * 保存当前用户的月度限额到 Firebase（用户子集合）
 * @param val 金额字符串
 * @param userId 当前用户ID（必传）
 */
export const saveMonthlyLimit = async (val: string, userId: string) => {
  if (!userId) {
    console.error('saveMonthlyLimit: userId is required');
    return;
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const limit = parseFloat(val) || 0;
  
  // ✅ 1. 写入 Firebase：users/{userId}/limits/{currentMonth}
  try {
    const limitRef = doc(db, 'users', userId, 'limits', currentMonth);
    await setDoc(limitRef, { 
      value: limit, 
      updatedAt: new Date() 
    }, { merge: true });
    console.log(`✅ Monthly limit saved for ${userId} / ${currentMonth}: ${limit}`);
  } catch (error) {
    console.error('Failed to save monthly limit to Firebase:', error);
  }
  
  // 2. 写入 AsyncStorage 作为备份
  await AsyncStorage.setItem(ASYNC_STORAGE_KEY, limit.toString());
};

/**
 * 实时监听当前用户的所有历史月度限额（用户子集合）
 * @returns unsubscribe 函数
 */
export const subscribeToUserMonthlyLimits = (
  userId: string,
  onUpdate: (limitsMap: Record<string, number>) => void
) => {
  const limitsRef = collection(db, 'users', userId, 'limits');
  return onSnapshot(
    limitsRef,
    (snapshot) => {
      const limitsMap: Record<string, number> = {};
      snapshot.docs.forEach((doc) => {
        limitsMap[doc.id] = doc.data().value; // doc.id = "YYYY-MM", 字段 value
      });
      onUpdate(limitsMap);
    },
    (error) => {
      console.error('User limits subscription error:', error);
    }
  );
};

// ---------- 原有工具函数（保留，未改动）----------
const { width: screenWidth } = Dimensions.get('window');

export const getUserGlobalStatsUrl = async (userId: string, limit: number = 2000) => {
  // ... 完全保持你原有的代码 ...
  try {
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    const groupSnap = await getDocs(qGroups);
    const monthlyTotals: { [key: string]: number } = {};
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
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const start = new Date(sortedMonths[0] + "-01");
    const end = new Date();
    let iterDate = new Date(start);

    while (iterDate <= end) {
      const key = iterDate.toISOString().substring(0, 7);
      const total = monthlyTotals[key] || 0;
      labels.push(key);

      if (key === currentMonthStr) {
        thisMonthTotal = total;
        if (total > limit) {
          safeData.push(limit);
          excessData.push(total - limit);
          bgColorsSafe.push('#07C160');
          bgColorsExcess.push('#FA5151');
        } else {
          safeData.push(total);
          excessData.push(0);
          bgColorsSafe.push('#07C160');
          bgColorsExcess.push('transparent');
        }
      } else {
        safeData.push(total);
        excessData.push(null);
        bgColorsSafe.push('#C6F6D5');
        bgColorsExcess.push('transparent');
      }
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    const barTotalHeights = labels.map((_, i) => {
      const base = safeData[i] || 0;
      const extra = Number(excessData[i]) || 0;
      return base + extra;
    });
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
      maxValue
    );

    return { url, width: dynamicWidth, count: labels.length, thisMonthTotal };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
};

export const getCurrentMonthSpend = async (userId: string): Promise<number> => {
  try {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    const groupSnap = await getDocs(qGroups);
    let total = 0;
    groupSnap.forEach(doc => {
      const data = doc.data();
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

// ---------- 🔥 核心：实时统计 + 历史限额（用户独立）----------
export const subscribeToUserStats = (
  userId: string,
  currentMonthLimit: number, // 当前月份的限额（用于基准线和降级）
  onUpdate: (data: { url: string; width: number; count: number; thisMonthTotal: number } | null) => void
): (() => void) => {
  try {
    // ---------- 1. 监听当前用户的所有历史限额（用户子集合）----------
    let monthlyLimits: Record<string, number> = {};
    const limitsUnsubscribe = subscribeToUserMonthlyLimits(userId, (limits) => {
      monthlyLimits = limits;
      if (Object.keys(groupMonthlyData).length > 0) {
        generateChartFromAllGroups();
      }
    });

    // ---------- 2. 原有的 groups + expenses 监听（完全不变）----------
    const groupsRef = collection(db, 'groups');
    const qGroups = query(groupsRef, where('participantIds', 'array-contains', userId));
    const expenseUnsubscribers: (() => void)[] = [];
    const groupMonthlyData: { [groupId: string]: { [month: string]: number } } = {};

    const generateChartFromAllGroups = () => {
      const monthlyTotals: { [key: string]: number } = {};
      let thisMonthTotal = 0;

      Object.values(groupMonthlyData).forEach((groupData) => {
        Object.entries(groupData).forEach(([month, amount]) => {
          monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
        });
      });

      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthsToShow = 12;
      const labels: string[] = [];
      const safeData: number[] = [];
      const excessData: (number | null)[] = [];
      const bgColorsSafe: string[] = [];
      const bgColorsExcess: string[] = [];

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const total = Math.round(monthlyTotals[monthKey] || 0);
        labels.push(monthKey);

        // 🔥 关键：该月的限额优先从 monthlyLimits（用户历史限额）取，若无则用 currentMonthLimit
        const limitForMonth = monthlyLimits[monthKey] ?? currentMonthLimit;

        if (monthKey === currentMonthStr) {
          thisMonthTotal = total;
          if (total > limitForMonth) {
            safeData.push(Math.round(limitForMonth));
            excessData.push(Math.round(total - limitForMonth));
            bgColorsSafe.push('#2563eb');
            bgColorsExcess.push('#FA5151');
          } else {
            safeData.push(total);
            excessData.push(null);
            bgColorsSafe.push('#2563eb');
            bgColorsExcess.push('transparent');
          }
        } else {
          if (total > limitForMonth) {
            safeData.push(Math.round(limitForMonth));
            excessData.push(Math.round(total - limitForMonth));
            bgColorsSafe.push('#93c5fd');
            bgColorsExcess.push('#fca5a5');
          } else {
            safeData.push(total);
            excessData.push(null);
            bgColorsSafe.push('#93c5fd');
            bgColorsExcess.push('transparent');
          }
        }
      }

      const barTotalHeights = labels.map((_, i) => {
        const base = safeData[i] || 0;
        const extra = Number(excessData[i]) || 0;
        return base + extra;
      });
      const maxValue = Math.max(...barTotalHeights, ...Object.values(monthlyLimits), currentMonthLimit);
      const barMinWidth = 80;
      const totalRequiredWidth = monthsToShow * barMinWidth;
      const dynamicWidth = Math.max(screenWidth - 32, totalRequiredWidth);

      const url = generateMonthlyBarChartUrl(
        labels,
        safeData,
        excessData,
        Math.round(currentMonthLimit),
        dynamicWidth,
        bgColorsSafe,
        bgColorsExcess,
        maxValue
      );

      onUpdate({
        url,
        width: dynamicWidth,
        count: labels.length,
        thisMonthTotal,
      });
    };

    const groupUnsubscribe = onSnapshot(
      qGroups,
      async (groupSnap) => {
        expenseUnsubscribers.forEach((u) => u());
        expenseUnsubscribers.length = 0;
        for (const key in groupMonthlyData) delete groupMonthlyData[key];

        for (const groupDoc of groupSnap.docs) {
          const groupData = groupDoc.data();
          const groupId = groupDoc.id;
          const groupMonthKey = groupData.startDate?.substring(0, 7);
          if (!groupMonthKey) continue;

          groupMonthlyData[groupId] = {};

          const expensesRef = collection(db, 'groups', groupId, 'expenses');
          const expenseUnsubscribe = onSnapshot(expensesRef, async (expenseSnap) => {
            const newMonthlyTotals: { [key: string]: number } = {};

            for (const expenseDoc of expenseSnap.docs) {
              const expenseData = expenseDoc.data();
              const userSplitAmount = expenseData.splits?.[userId] || 0;
              if (userSplitAmount > 0) {
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
                newMonthlyTotals[groupMonthKey] = (newMonthlyTotals[groupMonthKey] || 0) + amountInBase;
              }
            }

            groupMonthlyData[groupId] = newMonthlyTotals;
            generateChartFromAllGroups();
          });

          expenseUnsubscribers.push(expenseUnsubscribe);
        }
      },
      (error) => {
        console.error('Stats subscription error:', error);
        onUpdate(null);
      }
    );

    return () => {
      groupUnsubscribe();
      expenseUnsubscribers.forEach((u) => u());
      limitsUnsubscribe();
    };
  } catch (error) {
    console.error('Failed to subscribe to stats:', error);
    return () => {};
  }
};