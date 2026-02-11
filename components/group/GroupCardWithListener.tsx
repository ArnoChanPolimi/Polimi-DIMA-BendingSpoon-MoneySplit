// components\group\GroupCardWithListener.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { convertCurrency } from '@/services/exchangeRateApi';
import { auth, db } from '@/services/firebase';
import { collection, doc, getDocs, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

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

  return (
    <Pressable 
      onPress={onPress}
      onLongPress={handleDeleteGroup}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
      ]}
    >
      <ThemedView style={styles.cardContent}>
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
          <ThemedText style={styles.billId}>{group.id}</ThemedText>
        </View>

        <ThemedText type="defaultSemiBold" style={styles.groupName}>
          {group.name || 'Unnamed Group'}
        </ThemedText>

        <View style={styles.cardBottom}>
          <ThemedText style={styles.dateText}>{t('started')} {displayDate}</ThemedText>
          <ThemedText style={styles.amountText}>
            {/* 实时显示转换后的总金额 */}
            {Number(totalExpenses).toFixed(2)} €
          </ThemedText>
        </View>
      </ThemedView>
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
  },
  billId: { 
    fontSize: 10, 
    fontFamily: 'monospace', 
    opacity: 0.5,
    color: '#1f2937',
  },
  groupName: { 
    fontSize: 16, 
    marginBottom: 12, 
    color: '#1e293b',
    fontWeight: '700',
  },
  cardBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
  },
  dateText: { 
    fontSize: 12, 
    opacity: 0.6, 
    color: '#1f2937',
  },
  amountText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#dc2626',
  },
});
