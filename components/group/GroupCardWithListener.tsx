// components\group\GroupCardWithListener.tsx
import { ThemedText } from '@/components/themed-text';
import { convertCurrency } from '@/services/exchangeRateApi';
import { auth, db } from '@/services/firebase';
import { collection, doc, getDocs, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, Platform, Pressable, StyleSheet, View } from 'react-native';

interface GroupCardProps {
  group: any;
  status: string;
  safeExpenses: number;
  displayDate: string;
  onPress: () => void;
  onDelete?: (groupId: string) => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    notFinished: 'ONGOING',
    finished: 'FINISHED',
    started: 'Started',
  },
  zh: {
    notFinished: '进行中',
    finished: '已完成',
    started: '开始于',
  },
  it: {
    notFinished: 'IN CORSO',
    finished: 'COMPLETATO',
    started: 'Iniziato',
  },
};

export function GroupCard({
  group,
  status,
  safeExpenses: initialExpenses,
  displayDate,
  onPress,
  onDelete,
}: GroupCardProps) {
  const [totalExpenses, setTotalExpenses] = useState(initialExpenses);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [language] = useState('en');

  // 处理删除群组
  const handleDeleteGroup = async () => {
    Alert.alert(
      'Delete Group?',
      'This will permanently delete the group and all its expenses. Are you sure?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // 删除群组中的所有费用
              const expensesRef = collection(db, "groups", group.id, "expenses");
              const expensesQuery = query(expensesRef);
              const expensesSnapshot = await getDocs(expensesQuery);
              
              const batch = writeBatch(db);
              
              // 添加所有费用删除到 batch
              expensesSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
              });
              
              // 删除群组文档
              batch.delete(doc(db, "groups", group.id));
              
              // 提交批量操作
              await batch.commit();
              
              if (onDelete) {
                onDelete(group.id);
              }
              Alert.alert('Success', 'Group deleted successfully!');
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // 计算汇率转换后的总金额
  const calculateTotalWithCurrencyConversion = async (expenses: any[]) => {
    if (!expenses || expenses.length === 0) {
      setTotalExpenses(0);
      return;
    }

    const myUid = auth.currentUser?.uid; // 获取当前用户 ID
    const baseCurrency = 'EUR';
    let myTotal = 0;

    for (const expense of expenses) {
      let myShare = expense.splits && myUid ? (expense.splits[myUid] || 0) : 0;
      let amountInBase = expense.amount || 0;
      
      // 如果费用有货币信息且不是 EUR，转换到 EUR
      // 如果这笔钱的分摊额不是 EUR，转换到 EUR（保持你原有的汇率转换逻辑）
      if (myShare > 0 && expense.currency && expense.currency !== baseCurrency) {
        try {
          const conversionResult = await convertCurrency(
            myShare,
            expense.currency as any,
            baseCurrency as any
          );
          if (conversionResult?.success) {
            myShare = conversionResult.convertedAmount;
          }
        } catch (error) {
          console.error(`Currency conversion error:`, error);
        }
      }
      
      myTotal += myShare;
    }

    setTotalExpenses(myTotal); // 现在的 totalExpenses 其实是 myTotal
  };
  // 实时监听该 group 的 expenses 变化 和 status 变化
  useEffect(() => {
    const expensesRef = collection(db, "groups", group.id, "expenses");
    const expensesQuery = query(expensesRef, orderBy("createdAt", "desc"));
    
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      calculateTotalWithCurrencyConversion(expenses);
    }, (error) => {
      console.error(`Error listening to expenses for group ${group.id}:`, error);
      setTotalExpenses(initialExpenses);
    });

    // 监听群组状态变化
    const groupRef = doc(db, "groups", group.id);
    const unsubscribeGroup = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status) {
          setCurrentStatus(data.status);
        }
      }
    }, (error) => {
      console.error(`Error listening to group ${group.id}:`, error);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeGroup();
    };
  }, [group.id, initialExpenses]);

  const t = (key: string) => {
    return translations[language]?.[key] ?? translations['en'][key] ?? key;
  };

  // --- 逻辑准备：解析封面数据 ---
  // --- 逻辑准备：解析封面数据 ---
  const coverData = group?.cover; 
  const isImage = coverData?.type === 'image';
  const isColor = coverData?.type === 'color';
  const coverValue = coverData?.value;
  const hasCustomCover = isImage || isColor;

  // 修复类型报错：如果不是图片，传 undefined 而不是 null
  const imageSource = isImage && coverValue ? { uri: coverValue as string } : undefined;

  return (
    <Pressable 
      onPress={onPress}
      onLongPress={handleDeleteGroup}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
      ]}
    >
      {/* 变动点 1: 使用 ImageBackground 替代原有的 ThemedView */}
      <ImageBackground
        source={imageSource}
        style={[
          styles.cardContent, 
          isColor ? { backgroundColor: coverValue } : null,
          !hasCustomCover && { backgroundColor: 'rgba(219, 234, 254, 0.7)' } // 默认蓝色
        ]}
        imageStyle={{ opacity: isImage ? 0.8 : 1 }} // 如果是图片，稍微给点透明度让文字更清晰
      >
        {/* 变动点 2: 增加一个 Overlay 层，统一处理内边距和图片上的遮罩效果 */}
        <View style={[
          styles.innerContent, 
          isImage && { backgroundColor: 'rgba(0, 0, 0, 0.2)' } // 图片背景加深遮罩
        ]}>
          
          <View style={styles.cardTop}>
            {/* 像素风状态标签 */}
            <View style={[
              styles.statusPill, 
              { 
                backgroundColor: currentStatus === 'ongoing' ? '#fecaca' : '#e5e7eb',
                borderColor: currentStatus === 'ongoing' ? '#ef4444' : '#9ca3af',
              }
            ]}>
              <ThemedText style={[
                styles.statusText, 
                { color: currentStatus === 'ongoing' ? '#dc2626' : '#4b5563' }
              ]}>
                {(currentStatus === 'ongoing' ? t('notFinished') : t('finished')).toUpperCase()} 
              </ThemedText>
            </View>
            
            {/* 变动点 3: 动态文字颜色 - ID 在自定义背景下变为半透明白 */}
            <ThemedText style={[
              styles.billId, 
              hasCustomCover && { color: 'rgba(255, 255, 255, 0.9)' }
            ]}>
              {/* {group.id.split('-').pop()} */}
              {group.id} {/* 直接展示完整的 id */}
            </ThemedText>
          </View>

          {/* 变动点 4: 动态文字颜色 - 组名在自定义背景下变为白色 */}
          <ThemedText type="defaultSemiBold" style={[
            styles.groupName, 
            hasCustomCover && { color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }
          ]}>
            {group.name || 'Unnamed Group'}
          </ThemedText>

          <View style={styles.cardBottom}>
            <ThemedText style={[
              styles.dateText, 
              hasCustomCover && { color: 'rgba(255, 255, 255, 0.8)' }
            ]}>
              {t('started')} {displayDate}
            </ThemedText>

            {/* 核心改动：去掉 amountBadge 容器，直接写 Text */}
            <ThemedText style={styles.amountText}>
              {Number(totalExpenses).toFixed(2)} €
            </ThemedText>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { 
    marginBottom: 16, 
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#60a5fa',
  },
  cardContent: {
    // 移除硬编码的背景色，移到组件内联样式中
    minHeight: 130, // 稍微增加高度让图片更有张力
  },
  innerContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    fontWeight: '700',
  },
  billId: { 
    fontSize: 10, 
    fontFamily: 'monospace', 
    opacity: 0.5,
    color: '#1f2937',
  },
  groupName: { 
    fontSize: 20, // 增大字体，更有电影感
    color: '#1e293b',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // 给文字加点阴影防止背景干扰
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateText: { 
    fontSize: 12, 
    opacity: 0.8, 
    color: '#1f2937',
  },
  amountText: { 
    // 1. 字体变小：从之前的 22 调小到 16-18
    fontSize: 17, 
    
    // 2. 字体加粗：'900' 是最粗的级别
    fontWeight: '900', 
    
    // 3. 颜色保持亮白色
    color: '#FFFFFF', 
    
    // 4. 字体风格
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',

    // 5. 投影增强：字变小了，投影需要更凝聚才能看清
    textShadowColor: 'rgba(0, 0, 0, 0.8)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2, 
  },
  
  cardBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    // 因为字变小了，建议用 center 对齐，让日期和金额在一条水平线上
    alignItems: 'center', 
    marginTop: 8,
  },
});