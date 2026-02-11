// app\group\[groupId]\index.tsx
import { MOCK_GROUPS_DATA } from '@/assets/data/mockGroups';
import { auth, db, uploadImageAndGetUrl } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { useCurrency } from '@/core/currency/CurrencyContext';
import { t } from '@/core/i18n';
import { useSettings } from '@/core/settings/SettingsContext';
import { convertCurrency } from '@/services/exchangeRateApi';

import { handleReceiptCapture } from '@/services/external/cameraService';

type InvolvedFriend = {
  uid: string;
  displayName: string;
  claimedAmount?: string;
  avatar?: { type: "default" | "color" | "custom"; value: string };
};

type GroupDetail = {
  id: string;
  name: string;
  startDate: string;
  totalExpenses: number;
  status: 'ongoing' | 'finished';
  involvedFriends?: InvolvedFriend[];
  receiptUrls?: string[];
  ownerId: string;
  payerIds?: string[];
  participantIds?: string[];
};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  amountInBase?: number;
  createdAt: number;
  participants: string[];
  payers: string[];
  splitMode?: 'equal' | 'ratio' | 'custom';
  splits?: { [uid: string]: number };
  currency?: string;
  receiptUrls?: string[];
};

// 默认头像库映射
const DEFAULT_AVATARS: { [key: string]: any } = {
  'avatar_1': require('@/assets/images/avatars/avatar_1.png'),
  'avatar_2': require('@/assets/images/avatars/avatar_2.png'),
  'avatar_3': require('@/assets/images/avatars/avatar_3.png'),
  'avatar_4': require('@/assets/images/avatars/avatar_4.png'),
  'avatar_5': require('@/assets/images/avatars/avatar_5.png'),
  'avatar_6': require('@/assets/images/avatars/avatar_6.png'),
  'avatar_7': require('@/assets/images/avatars/avatar_7.png'),
  'avatar_8': require('@/assets/images/avatars/avatar_8.png'),
};

// 渲染头像组件
const renderAvatar = (friend: InvolvedFriend | null, size: number = 32) => {
  if (!friend) {
    return (
      <View style={{ width: size, height: size, borderRadius: 0, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: size * 0.4 }}>U</ThemedText>
      </View>
    );
  }

  const displayName = friend.displayName || 'U';
  
  if (!friend.avatar) {
    // 默认显示首字母
    return (
      <View style={{ width: size, height: size, borderRadius: 0, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: Math.floor(size * 0.4) }}>{displayName[0].toUpperCase()}</ThemedText>
      </View>
    );
  }

  if (friend.avatar.type === 'default') {
    const source = DEFAULT_AVATARS[friend.avatar.value];
    if (source) {
      return <Image source={source} style={{ width: size, height: size, borderRadius: 0 }} />;
    }
  } else if (friend.avatar.type === 'color') {
    return (
      <View style={{ width: size, height: size, borderRadius: 0, backgroundColor: friend.avatar.value, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: Math.floor(size * 0.4) }}>{displayName[0].toUpperCase()}</ThemedText>
      </View>
    );
  } else if (friend.avatar.type === 'custom') {
    return <Image source={{ uri: friend.avatar.value }} style={{ width: size, height: size, borderRadius: 0 }} />;
  }

  // 回退方案
  return (
    <View style={{ width: size, height: size, borderRadius: 0, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: Math.floor(size * 0.4) }}>{displayName[0].toUpperCase()}</ThemedText>
    </View>
  );
};

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const navigation = useNavigation();
  const { language } = useSettings();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allFriends, setAllFriends] = useState<InvolvedFriend[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRole, setActiveRole] = useState<'payer' | 'participant'>('participant');
  const [activeTab, setActiveTab] = useState<'owner' | 'payer' | 'participant'>('owner');

  // Add Expense 相关状态
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  // 多币种输入
  const { defaultCurrency, convertAmount, supportedCurrencies, currencySymbols } = useCurrency();
  const [inputCurrency, setInputCurrency] = useState(defaultCurrency);
  const [expenseAmount, setExpenseAmount] = useState(''); // 输入框金额
  const [convertedAmount, setConvertedAmount] = useState<string>(''); // 主币种金额
  const [isConverting, setIsConverting] = useState(false);
  const [splitMode, setSplitMode] = useState<'equal' | 'ratio' | 'custom'>('equal');
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [ratios, setRatios] = useState<{ [uid: string]: string }>({});
  const [customAmounts, setCustomAmounts] = useState<{ [uid: string]: string }>({});
  // 币种选择 Modal 状态
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // 新增：Receipts 相关状态
  const [receipts, setReceipts] = useState<string[]>([]);
  
  // 新增：Expense Detail Modal 状态
  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedPayers, setEditedPayers] = useState<string[]>([]);
  const [editedParticipants, setEditedParticipants] = useState<string[]>([]);
  const [editedCurrency, setEditedCurrency] = useState(defaultCurrency);
  const [editedSplitMode, setEditedSplitMode] = useState<'equal' | 'ratio' | 'custom'>('equal');
  const [editedRatios, setEditedRatios] = useState<{ [uid: string]: string }>({});
  const [editedCustomAmounts, setEditedCustomAmounts] = useState<{ [uid: string]: string }>({});
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  
  // 添加：用于存储实时转换后的总金额
  const [totalSpendingInBase, setTotalSpendingInBase] = useState(0);
  
  // 新增：日期选择相关状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  
  // 新增：收据大图查看状态
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // [新增] 用于存储当前用户在这个群组里的个人分摊总额
  const [myPersonalTotal, setMyPersonalTotal] = useState(0);
  
  // 新增：编辑模式下的收据状态
  const [editedReceipts, setEditedReceipts] = useState<string[]>([]);

  // --- 1. 删除成员逻辑 (修正版) ---
  const handleRemoveMember = async (person: InvolvedFriend, role: 'payer' | 'participant') => {
    if (!groupId || !group) return;

    const performDelete = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const updateData: any = {};
        
        // 获取最新的数组快照，防止闭包旧数据干扰
        const currentPayers = group.payerIds || [];
        const currentParticipants = group.participantIds || [];

        // 1. 移除对应角色的 ID
        if (role === 'payer') {
          updateData.payerIds = arrayRemove(person.uid);
        } else {
          updateData.participantIds = arrayRemove(person.uid);
        }
        
        // 2. 逻辑判断：如果删了这个角色后，他不再担任任何角色，则从总名单移除
        // 检查他是否还在另一个列表里
        const remainsInOtherRole = role === 'payer' 
          ? currentParticipants.includes(person.uid) 
          : currentPayers.includes(person.uid);

        if (!remainsInOtherRole) {
          // 💡 极其重要：必须手动剔除除了 uid 和 displayName 以外的所有字段（如 claimedAmount）
          // 否则 Firebase arrayRemove 找不到完全一样的对象，就会静默失败！
          const basicPerson = { uid: person.uid, displayName: person.displayName };
          updateData.involvedFriends = arrayRemove(basicPerson);
        }

        await updateDoc(groupRef, updateData);
      } catch (error) {
        console.error("Delete failed:", error);
        Alert.alert("Error", "Failed to remove member.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${person.displayName}?`)) performDelete();
    } else {
      Alert.alert("Remove Member", `Remove ${person.displayName}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: performDelete, style: "destructive" }
      ]);
    }
  };

  // --- 2. 添加成员逻辑 (严谨版) ---
  const handleAddMember = async (friend: InvolvedFriend, role: 'payer' | 'participant') => {
    if (!groupId || !group) return;

    const isAlreadyPayer = group.payerIds?.includes(friend.uid);
    const isAlreadyParticipant = group.participantIds?.includes(friend.uid);
    const isAlreadyInvolvedFriend = group.involvedFriends?.some(f => f.uid === friend.uid);

    if (role === 'payer' && isAlreadyPayer) return;
    if (role === 'participant' && isAlreadyParticipant) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      
      // 💡 关键修改：只提取最基础的字段，避免 claimedAmount 干扰匹配
      const basicFriend = { uid: friend.uid, displayName: friend.displayName };
      
      const updateData: any = {};
      
      // 只在还未加入的情况下才添加到 involvedFriends
      if (!isAlreadyInvolvedFriend) {
        updateData.involvedFriends = arrayUnion(basicFriend);
      }

      if (role === 'payer') {
        updateData.payerIds = arrayUnion(friend.uid);
        // 支付者一定是参与者
        if (!isAlreadyParticipant) {
          updateData.participantIds = arrayUnion(friend.uid);
        }
      } else {
        // 💡 参与者仅更新自己，不碰 payerIds
        updateData.participantIds = arrayUnion(friend.uid);
      }

      await updateDoc(groupRef, updateData);
    } catch (e) {
      console.error("Add member error:", e);
    }
  };
  // --- 3. 认领金额逻辑 ---
  const handleClaimAmount = (person: InvolvedFriend) => {
    const onConfirm = async (value: string | null) => {
      if (!value || isNaN(Number(value)) || !groupId) return;
      try {
        const groupRef = doc(db, "groups", groupId);
        const newFriends = group?.involvedFriends?.map((f) => 
          f.uid === person.uid ? { ...f, claimedAmount: value } : f
        ) || [];
        await updateDoc(groupRef, { involvedFriends: newFriends });
      } catch (e) { console.error(e); }
    };

    if (Platform.OS === 'web') {
      const val = window.prompt(`Claim amount for ${person.displayName}:`, person.claimedAmount || "");
      onConfirm(val);
    } else {
      Alert.prompt("Claim Amount", "Enter amount:", (v) => onConfirm(v), "plain-text", person.claimedAmount || "");
    }
  };

  // --- 4. 日期更新逻辑 ---
  const handleUpdateDate = async () => {
    if (!groupId) return;
    try {
      const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
      // 确保日期不超过今天
      const today = new Date();
      if (date > today) {
        Alert.alert('Error', 'Cannot select future dates');
        return;
      }
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, { startDate: dateStr });
      setShowDatePicker(false);
      Alert.alert('Success', 'Group date updated successfully!');
    } catch (e) {
      console.error('Update date error:', e);
      Alert.alert('Error', 'Failed to update group date');
    }
  };

  // 获取当前月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 生成年份数组（过去5年到今年）
  const generateYears = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  // 生成月份数组
  const generateMonths = () => Array.from({ length: 12 }, (_, i) => i + 1);



  // --- 5. 重置 Expense 表单 ---
  const resetExpenseForm = () => {
    setExpenseTitle('');
    setExpenseAmount('');
    setConvertedAmount('');
    setInputCurrency(defaultCurrency);
    setIsConverting(false);
    setSplitMode('equal');
    setSelectedPayers([]);
    setSelectedParticipants([]);
    setRatios({});
    setCustomAmounts({});
    setReceipts([]);
  };

  /**
 * 修改后的完整 pickReceipt
 * 替换了原有的权限申请和 ImagePicker 直接调用
 */
  const pickReceipt = async (mode: 'camera' | 'library') => {
    try {
      // 1. 调用我们在 cameraService 中封装的逻辑
      // 它包含了你原来的 ImagePicker.launchImageLibraryAsync 逻辑
      // 同时也新增了 ImagePicker.launchCameraAsync 逻辑
      const uri = await handleReceiptCapture(mode);
      
      if (uri) {
        // 2. 状态更新逻辑升级：
        // 如果当前正在编辑已有的账单，更新 editedReceipts
        // 如果是新开的账单，更新 receipts
        if (isEditingExpense) {
          setEditedReceipts((prev) => [...prev, uri]);
        } else {
          setReceipts((prev) => [...prev, uri]);
        }
      }
    } catch (e) {
      console.error('Pick receipt error:', e);
      
      // 统一的错误反馈
      const errorMessage = mode === 'camera' ? 'Failed to take photo' : 'Failed to pick image';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  // --- 完成群组功能 ---
  const handleFinishGroup = async () => {
    if (!groupId) return;
    
    Alert.alert(
      'Finish Group?',
      'This will mark the group as finished. Are you sure?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            try {
              const groupRef = doc(db, "groups", groupId);
              await updateDoc(groupRef, { status: 'finished' });
              Alert.alert('Success', 'Group finished successfully!');
            } catch (error) {
              console.error('Error finishing group:', error);
              Alert.alert('Error', 'Failed to finish group');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // --- 6. 打开 Expense Modal ---
  const openExpenseModal = () => {
    // 默认选中所有参与者
    const allParticipantIds = group?.participantIds || [];
    setSelectedParticipants(allParticipantIds);
    // 默认选中所有付款人
    const allPayerIds = group?.payerIds || [];
    setSelectedPayers(allPayerIds.length > 0 ? allPayerIds : (auth.currentUser ? [auth.currentUser.uid] : []));
    setShowExpenseModal(true);
  };

  // --- 7. 保存 Expense ---
  const handleSaveExpense = async () => {
    const trimmedTitle = expenseTitle.trim(); // 1. 统一去除首尾空格
    // 以主币种金额为准
    // const amount = parseFloat(convertedAmount);
    const amount = parseFloat(expenseAmount);
    // 2. 原始合法性校验（保留原样）
    if (!expenseTitle.trim() || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid title and amount');
      return;
    }

    // 3. 重名检查（仅保留一套，放在 try 之前）
    const isDuplicate = expenses.some(
      (exp) => exp.title.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (isDuplicate) {
      Alert.alert(
        'Duplicate Name', 
        'An expense with this name already exists. Please use a unique title.'
      );
      return;
    }

    // 4. 参与人和付款人校验
    if (selectedParticipants.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }
    if (selectedPayers.length === 0) {
      Alert.alert('Error', 'Please select at least one payer');
      return;
    }

    try {
      let cloudUrls: string[] = []; 
      if (receipts.length > 0) {
        const uploadTasks = receipts.map(uri => 
          uploadImageAndGetUrl(uri, auth.currentUser!.uid)
        );
        cloudUrls = await Promise.all(uploadTasks);
      }
      const splits: { [uid: string]: number } = {};
      // 计算每人应付金额
      if (splitMode === 'equal') {
        const perPerson = amount / selectedParticipants.length;
        selectedParticipants.forEach(uid => {
          splits[uid] = perPerson;
        });
      } else if (splitMode === 'ratio') {
        let totalRatio = 0;
        selectedParticipants.forEach(uid => {
          totalRatio += parseFloat(ratios[uid] || '1');
        });
        selectedParticipants.forEach(uid => {
          const ratio = parseFloat(ratios[uid] || '1');
          splits[uid] = (ratio / totalRatio) * amount;
        });
      } else {
        selectedParticipants.forEach(uid => {
          splits[uid] = parseFloat(customAmounts[uid] || '0');
        });
      }

      // 如果输入货币不是 EUR，转换到 EUR 基准货币
      const baseCurrency = 'EUR';
      let amountInBase = amount;

      if (inputCurrency && inputCurrency !== baseCurrency) {
        const conversionResult = await convertCurrency(
          amount,
          inputCurrency as any,
          baseCurrency as any
        );
        if (conversionResult?.success) {
          amountInBase = conversionResult.convertedAmount;
        }
      }

      const expenseData = {
        // title: expenseTitle.trim(),
        title: trimmedTitle, // 这里改用处理过的变量，确保存入的是 clean 数据
        amount: amount, // 保存原始输入的金额
        currency: inputCurrency,
        // --- 关键新增：记录存入瞬间的 EUR 金额 ---
        amountInBase: amountInBase,
        // inputCurrency: inputCurrency,
        inputAmount: parseFloat(expenseAmount),
        splitMode: splitMode,
        payers: selectedPayers,
        participants: selectedParticipants,
        splits: splits,
        createdAt: Date.now(),
        createdBy: auth.currentUser?.uid,
        receiptUrls: cloudUrls, // 保存收据图片
      };

      await addDoc(collection(db, "groups", groupId!, "expenses"), expenseData);
      // 使用转换后的金额（EUR）更新总额
      await updateDoc(doc(db, "groups", groupId!), {
        totalExpenses: increment(amountInBase)
      });
      setShowExpenseModal(false);
      resetExpenseForm();
      Alert.alert('Success', 'Expense added successfully!');
    } catch (e) {
      console.error('Save expense error:', e);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${selectedExpense.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. 删除具体的费用文档
              await deleteDoc(doc(db, "groups", groupId!, "expenses", selectedExpense.id));

              // 2. 冲抵总账 (减法)
              // 优先取快照值，没有则取 amount (兼容旧数据)
              const refundAmount = selectedExpense.amountInBase || selectedExpense.amount;
              await updateDoc(doc(db, "groups", groupId!), {
                totalExpenses: increment(-refundAmount)
              });

              setShowExpenseDetailModal(false);
              Alert.alert('Success', 'Expense deleted');
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleSaveEditedExpense = async () => {
    if (!selectedExpense || !groupId) return;
    
    try {

      let finalCloudUrls = editedReceipts;
      const newLocalReceipts = editedReceipts.filter(uri => uri.startsWith('file://') || uri.startsWith('blob:'));
      
      if (newLocalReceipts.length > 0) {
        const uploadTasks = newLocalReceipts.map(uri => uploadImageAndGetUrl(uri, auth.currentUser!.uid));
        const uploadedUrls = await Promise.all(uploadTasks);
        // 替换掉数组里的本地路径
        finalCloudUrls = editedReceipts.map(uri => 
          (uri.startsWith('file://') || uri.startsWith('blob:')) ? uploadedUrls.shift()! : uri
        );
      }
      const parsedAmount = parseFloat(editedAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (!editedTitle.trim()) {
        Alert.alert('Error', 'Please enter an expense name');
        return;
      }

      if (editedPayers.length === 0) {
        Alert.alert('Error', 'Please select at least one payer');
        return;
      }

      if (editedParticipants.length === 0) {
        Alert.alert('Error', 'Please select at least one participant');
        return;
      }

      // Calculate splits based on split mode
      let splits: { [uid: string]: number } = {};
      const splitMode = editedSplitMode;

      if (splitMode === 'equal') {
        const splitAmount = parsedAmount / editedParticipants.length;
        editedParticipants.forEach(pid => {
          splits[pid] = splitAmount;
        });
      } else if (splitMode === 'ratio') {
        // Use edited ratios
        const totalRatio = editedParticipants.reduce((sum, pid) => {
          const ratio = parseFloat(editedRatios[pid] || '0');
          return sum + (isNaN(ratio) ? 0 : ratio);
        }, 0);
        
        if (totalRatio > 0) {
          editedParticipants.forEach(pid => {
            const ratio = parseFloat(editedRatios[pid] || '0');
            splits[pid] = isNaN(ratio) ? 0 : (ratio / totalRatio) * parsedAmount;
          });
        } else {
          // Fallback to equal split
          const splitAmount = parsedAmount / editedParticipants.length;
          editedParticipants.forEach(pid => {
            splits[pid] = splitAmount;
          });
        }
      } else if (splitMode === 'custom') {
        // Use edited custom amounts
        const totalAmount = editedParticipants.reduce((sum, pid) => {
          const amount = parseFloat(editedCustomAmounts[pid] || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        editedParticipants.forEach(pid => {
          const amount = parseFloat(editedCustomAmounts[pid] || '0');
          splits[pid] = isNaN(amount) ? 0 : amount;
        });
      }

      // Update expense document
      const expenseRef = doc(db, "groups", groupId, "expenses", selectedExpense.id);
      await updateDoc(expenseRef, {
        title: editedTitle,
        amount: parsedAmount,
        participants: editedParticipants,
        payers: editedPayers,
        splits: splits,
        currency: editedCurrency,
        splitMode: editedSplitMode,
        // receiptUrls: editedReceipts, // 直接使用 editedReceipts 可能包含本地路径，必须先处理上传
        receiptUrls: finalCloudUrls, //  使用处理后的云端 URL
      });

      // Calculate amount difference for group totalExpenses update
      // If currency changed, need to convert to base currency for comparison
      const baseCurrency = 'EUR'; // 设定 EUR 为基准货币
      
      let oldAmountInBase = selectedExpense.amount;
      let newAmountInBase = parsedAmount;

      // 如果旧账单有货币信息且不是 EUR，转换到 EUR
      if (selectedExpense.currency && selectedExpense.currency !== baseCurrency) {
        const conversionResult = await convertCurrency(
          selectedExpense.amount,
          selectedExpense.currency as any,
          baseCurrency as any
        );
        if (conversionResult?.success) {
          oldAmountInBase = conversionResult.convertedAmount;
        }
      }

      // 如果新账单货币不是 EUR，转换到 EUR
      if (editedCurrency && editedCurrency !== baseCurrency) {
        const conversionResult = await convertCurrency(
          parsedAmount,
          editedCurrency as any,
          baseCurrency as any
        );
        if (conversionResult?.success) {
          newAmountInBase = conversionResult.convertedAmount;
        }
      }

      const amountDifference = newAmountInBase - oldAmountInBase;

      // Update group totalExpenses with converted amount
      if (Math.abs(amountDifference) > 0.01) { // 使用 0.01 作为浮点数比较阈值
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, {
          totalExpenses: increment(amountDifference),
        });
      }

      setIsEditingExpense(false);
      setShowExpenseDetailModal(false);
      Alert.alert('Success', 'Expense updated successfully!');
    } catch (e) {
      console.error('Save edited expense error:', e);
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  // 计算实时总金额（包含汇率转换）
  const calculateTotalWithCurrencyConversion = async () => {
    if (!expenses || expenses.length === 0) {
      setTotalSpendingInBase(0);
      return;
    }

    const baseCurrency = 'EUR';
    let total = 0;

    for (const expense of expenses) {
      let amountInBase = expense.amount || 0;
      
      // 如果费用有货币信息且不是 EUR，转换到 EUR
      if (expense.currency && expense.currency !== baseCurrency) {
        const conversionResult = await convertCurrency(
          amountInBase,
          expense.currency as any,
          baseCurrency as any
        );
        if (conversionResult?.success) {
          amountInBase = conversionResult.convertedAmount;
        }
      }
      
      total += amountInBase;
    }

    setTotalSpendingInBase(total);
  };

  // 在 expenses 变化时重新计算总金额
  useEffect(() => {
    calculateTotalWithCurrencyConversion();
  }, [expenses]);

  useEffect(() => {
    if (!groupId) return;
    const staticGroup = MOCK_GROUPS_DATA[groupId];
    if (staticGroup) { setGroup(staticGroup); setLoading(false); return; }

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) { setLoading(false); return; }
      const unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
        if (snap.exists()) setGroup({ id: snap.id, ...snap.data() } as GroupDetail);
        setLoading(false);
      });
      const unsubExpenses = onSnapshot(query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc")), (snap) => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[]);
        // [新增逻辑开始]
        const exps = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseItem[];
        setExpenses(exps);

        const myUid = auth.currentUser?.uid;
        if (myUid) {
          const total = exps.reduce((sum, exp) => {
            // 关键：从每笔 expense 的 splits 对象（注意：你的定义里 splits 是 {[uid: string]: number}）中找我的钱
            const myShare = exp.splits && exp.splits[myUid] ? exp.splits[myUid] : 0;
            return sum + myShare;
          }, 0);
          setMyPersonalTotal(total);
        }
        // [新增逻辑结束]
      });
      const unsubFriends = onSnapshot(query(collection(db, "users", user.uid, "friends"), orderBy("displayName", "asc")), (snap) => {
        setAllFriends(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as any);
      });
      return () => { unsubGroup(); unsubExpenses(); unsubFriends(); };
    });
    return () => unsubAuth();
  }, [groupId]);

  if (loading) return <AppScreen><ActivityIndicator style={{marginTop: 50}} /></AppScreen>;
  if (!group) return <AppScreen><AppTopBar title="Error" showBack /><ThemedText>Group Not Found</ThemedText></AppScreen>;

  return (
    <AppScreen>
      <AppTopBar 
        title={group.name} 
        showBack 
        onBackPress={() => navigation.canGoBack() ? router.back() : router.replace("/")}
        rightIconName={group.status === 'finished' ? undefined : "checkmark-done"}
        onRightIconPress={group.status !== 'finished' ? handleFinishGroup : undefined}
      />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        <ThemedView style={styles.headerCard}>
          <View style={styles.idBadge}><ThemedText style={styles.idBadgeText}>BILL NO: {group.id}</ThemedText></View>
          <Pressable onPress={() => {
            const [year, month, day] = group.startDate.split('-').map(Number);
            setSelectedYear(year);
            setSelectedMonth(month);
            setSelectedDay(day);
            setShowDatePicker(true);
          }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText style={styles.dateText}>{t('date')} {group.startDate}</ThemedText>
            <Ionicons name="create" size={16} color="#ffffff" />
          </Pressable>
          <ThemedText type="title" style={styles.totalAmount}>
            {/* {totalSpendingInBase.toFixed(2)} €
             */}
            {myPersonalTotal.toFixed(2)} €
          </ThemedText>
          <ThemedText style={styles.totalLabel}>{t('myShareTotalSpending')}</ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Group Members</ThemedText>
        
        {/* Tab 切换栏 */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'owner' && styles.activeTab]}
            onPress={() => setActiveTab('owner')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'owner' && styles.activeTabText]}>
              Owner
            </ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'payer' && styles.activeTab]}
            onPress={() => setActiveTab('payer')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'payer' && styles.activeTabText]}>
              Paid By
            </ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'participant' && styles.activeTab]}
            onPress={() => setActiveTab('participant')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'participant' && styles.activeTabText]}>
              Splitting
            </ThemedText>
          </Pressable>
        </View>

        {/* 成员内容区域 */}
        <View style={styles.roleContainer}>
          {/* Owner Tab 内容 */}
          {activeTab === 'owner' && (
            <View style={styles.memberContent}>
              <View style={styles.memberRow}>
                {group.involvedFriends?.filter(f => f.uid === group.ownerId).map((f, i) => (
                  <View key={`owner-${f.uid}-${i}`} style={[styles.memberChip, styles.ownerChip]}>
                    <View style={styles.memberAvatar}>
                      <ThemedText style={styles.memberAvatarText}>{f.displayName[0].toUpperCase()}</ThemedText>
                    </View>
                    <ThemedText style={styles.ownerText}>{f.displayName}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Paid By Tab 内容 */}
          {activeTab === 'payer' && (
            <View style={styles.memberContent}>
              <View style={styles.memberRow}>
                {group.involvedFriends?.filter(f => group.payerIds?.includes(f.uid)).map((f, i) => (
                  <Pressable 
                    key={`payer-${f.uid}-${i}`} 
                    style={[styles.memberChip, styles.payerChip]} 
                    onPress={() => handleClaimAmount(f)}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: '#10b981' }]}>
                      <ThemedText style={styles.memberAvatarText}>{f.displayName[0].toUpperCase()}</ThemedText>
                    </View>
                    <ThemedText style={styles.payerText}>{f.displayName}</ThemedText>
                    <Pressable 
                      onPress={(e) => { e.stopPropagation(); handleRemoveMember(f, 'payer'); }} 
                      style={styles.deleteBtn}
                    >
                      <ThemedText style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>×</ThemedText>
                    </Pressable>
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.addMemberChip} 
                  onPress={() => { setActiveRole('payer'); setIsModalVisible(true); }}
                >
                  <ThemedText style={[styles.addMemberText, { color: '#10b981' }]}>+ Add Payer</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {/* Splitting With Tab 内容 */}
          {activeTab === 'participant' && (
            <View style={styles.memberContent}>
              <View style={styles.memberRow}>
                {group.involvedFriends?.filter(f => group.participantIds?.includes(f.uid)).map((f, i) => (
                  <Pressable 
                    key={`part-${f.uid}-${i}`} 
                    style={styles.memberChip} 
                    onPress={() => handleClaimAmount(f)}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: '#2563eb' }]}>
                      <ThemedText style={styles.memberAvatarText}>{f.displayName[0].toUpperCase()}</ThemedText>
                    </View>
                    <ThemedText style={styles.chipText}>{f.displayName}</ThemedText>
                    <Pressable 
                      onPress={(e) => { e.stopPropagation(); handleRemoveMember(f, 'participant'); }} 
                      style={styles.deleteBtn}
                    >
                      <ThemedText style={{ color: '#2563eb', fontSize: 14, fontWeight: '600' }}>×</ThemedText>
                    </Pressable>
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.addMemberChip} 
                  onPress={() => { setActiveRole('participant'); setIsModalVisible(true); }}
                >
                  <ThemedText style={[styles.addMemberText, { color: '#2563eb' }]}>+ Add Member</ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Expense History */}
        <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 }}>Expense History</ThemedText>
        {expenses.length === 0 ? (
          <ThemedText style={{ opacity: 0.6, textAlign: 'center', padding: 20 }}>No expenses yet</ThemedText>
        ) : (
          <View>
            {expenses.map((item) => (
              <Pressable 
                key={item.id} 
                onPress={() => {
                  setSelectedExpense(item);
                  setShowExpenseDetailModal(true);
                }}
                style={({ pressed }) => [
                  { backgroundColor: pressed ? '#f0f7ff' : '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 12, marginBottom: 8 }
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={{ fontWeight: '600', fontSize: 14, color: '#1e293b' }}>{item.title}</ThemedText>
                  {typeof item.amount === 'number' && (
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 14, color: '#2563eb' }}>
                      {((currencySymbols as any)[(item.currency as any) || 'EUR']) || item.currency || '€'}{item.amount.toFixed(2)}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Paid by: {item.payers?.map((payerId: string) => group.involvedFriends?.find(f => f.uid === payerId)?.displayName).filter(Boolean).join(', ') || 'Unknown'}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: '#64748b' }}>Split with: {item.participants?.map((participantId: string) => group.involvedFriends?.find(f => f.uid === participantId)?.displayName).filter(Boolean).join(', ') || 'Everyone'}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* Add New Expense 按钮 */}
        <Pressable style={styles.addExpenseBtn} onPress={openExpenseModal}>
          <ThemedText style={styles.addExpenseBtnText}>+ Add New Expense</ThemedText>
        </Pressable>
      </ScrollView>

      

      {/* Add Expense Modal */}
      <Modal visible={showExpenseModal} animationType="slide">
        <AppScreen>
          <View style={{ marginTop: 20 }}>
            <AppTopBar title="Add Expense" showBack onBackPress={() => { setShowExpenseModal(false); resetExpenseForm(); }} />
          </View>
          <ScrollView style={{ padding: 16 }}>
            {/* Expense Title */}
            <ThemedText style={styles.expenseLabel}>Expense Name</ThemedText>
            <TextInput
              style={styles.expenseInput}
              placeholder="e.g. Dinner, Transport..."
              placeholderTextColor="#94a3b8"
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />


            {/* Total Amount - 多币种输入 */}
            <ThemedText style={styles.expenseLabel}>Total Amount</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.expenseInput, { flex: 1 }]}
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={expenseAmount}
                onChangeText={async (val) => {
                  setExpenseAmount(val);
                  if (!val || isNaN(Number(val))) {
                    setConvertedAmount('');
                    return;
                  }
                  setIsConverting(true);
                  const res = await convertAmount(Number(val), inputCurrency, defaultCurrency);
                  setConvertedAmount(res !== null ? res.toFixed(2) : '');
                  setIsConverting(false);
                }}
              />
              <View style={{ width: 12 }} />
              <View style={[styles.expenseInput, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingHorizontal: 0, flex: undefined, width: Platform.OS === 'ios' ? 120 : 90, minWidth: 90, height: 48, marginBottom: 0 }]}> 
                <Pressable
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 12, justifyContent: 'space-between' }}
                  onPress={() => setShowCurrencyModal(true)}
                  accessibilityRole="button"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={{ fontWeight: 'bold', color: '#2563eb', fontSize: 15 }}>{currencySymbols[inputCurrency]} </ThemedText>
                    <ThemedText style={{ fontWeight: 'bold', color: '#2563eb', fontSize: 15 }}>{inputCurrency}</ThemedText>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#2563eb" style={{ marginLeft: 6 }} />
                </Pressable>
                {/* 币种选择 Modal */}
                <Modal
                  visible={!!showCurrencyModal}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCurrencyModal(false)}
                >
                  <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setShowCurrencyModal(false)} />
                  <View style={{ position: 'absolute', top: '40%', left: '10%', right: '10%', backgroundColor: '#fff', borderRadius: 8, padding: 16, elevation: 8 }}>
                    {supportedCurrencies.map((cur) => (
                      <Pressable
                        key={cur}
                        style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                        onPress={async () => {
                          setInputCurrency(cur);
                          setShowCurrencyModal(false);
                          if (expenseAmount && !isNaN(Number(expenseAmount))) {
                            setIsConverting(true);
                            const res = await convertAmount(Number(expenseAmount), cur, defaultCurrency);
                            setConvertedAmount(res !== null ? res.toFixed(2) : '');
                            setIsConverting(false);
                          } else {
                            setConvertedAmount('');
                          }
                        }}
                      >
                        <ThemedText style={{ fontSize: 16, color: cur === inputCurrency ? '#2563eb' : '#1e293b', fontWeight: cur === inputCurrency ? 'bold' : 'normal' }}>
                          {currencySymbols[cur]} {cur}
                        </ThemedText>
                        {cur === inputCurrency && <Ionicons name="checkmark" size={16} color="#2563eb" style={{ marginLeft: 8 }} />}
                      </Pressable>
                    ))}
                  </View>
                </Modal>
              </View>
            </View>
            {/* 显示主币种金额 */}
            <ThemedText style={{ color: '#2563eb', fontWeight: 'bold', marginBottom: 8 }}>
              {isConverting ? 'Converting...' : (convertedAmount ? `≈ ${currencySymbols[defaultCurrency]}${convertedAmount} (${defaultCurrency})` : '')}
            </ThemedText>

            {/* Split Mode Selection */}
            <ThemedText style={styles.expenseLabel}>Split Mode</ThemedText>
            <View style={styles.splitModeContainer}>
              <Pressable
                style={[styles.splitModeBtn, splitMode === 'equal' && styles.splitModeBtnActive]}
                onPress={() => setSplitMode('equal')}
              >
                <ThemedText style={[styles.splitModeText, splitMode === 'equal' && styles.splitModeTextActive]}>Equal</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.splitModeBtn, splitMode === 'ratio' && styles.splitModeBtnActive]}
                onPress={() => setSplitMode('ratio')}
              >
                <ThemedText style={[styles.splitModeText, splitMode === 'ratio' && styles.splitModeTextActive]}>Ratio</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.splitModeBtn, splitMode === 'custom' && styles.splitModeBtnActive]}
                onPress={() => setSplitMode('custom')}
              >
                <ThemedText style={[styles.splitModeText, splitMode === 'custom' && styles.splitModeTextActive]}>Custom</ThemedText>
              </Pressable>
            </View>

            {/* Receipts Selection - 规范化样式并移除多余切换栏 */}
            <ThemedText style={styles.expenseLabel}>Receipts</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              {Platform.OS !== 'web' && (
                <Pressable 
                  style={[styles.memberChip, { borderColor: '#2563eb', borderWidth: 1, backgroundColor: '#f0f7ff' }]} 
                  onPress={() => pickReceipt('camera')}
                >
                  <Ionicons name="camera-outline" size={18} color="#2563eb" />
                  <ThemedText style={{ color: '#2563eb', marginLeft: 6, fontWeight: '600' }}>Take Photo</ThemedText>
                </Pressable>
              )}
              <Pressable 
                style={[styles.memberChip, { borderColor: '#2563eb', borderWidth: 1, backgroundColor: '#f0f7ff' }]} 
                onPress={() => pickReceipt('library')}
              >
                <Ionicons name="images-outline" size={18} color="#2563eb" />
                <ThemedText style={{ color: '#2563eb', marginLeft: 6, fontWeight: '600' }}>
                  {Platform.OS === 'web' ? 'Upload File' : 'Library'}
                </ThemedText>
              </Pressable>
            </View>

            {/* 图片预览列表 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {receipts.map((uri, index) => (
                <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                  <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 8 }} />
                  <Pressable 
                    onPress={() => setReceipts(prev => prev.filter((_, i) => i !== index))}
                    style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ThemedText style={{ color: 'white', fontSize: 12 }}>×</ThemedText>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            {/* 【收据 UI 插入结束】 */}

            {/* Payers Selection */}
            <ThemedText style={styles.expenseLabel}>Who Paid?</ThemedText>
            <View style={styles.participantGrid}>
              {group.involvedFriends?.map((f) => (
                <Pressable
                  key={`payer-select-${f.uid}`}
                  style={[
                    styles.participantChip,
                    selectedPayers.includes(f.uid) && styles.participantChipActive
                  ]}
                  onPress={() => {
                    setSelectedPayers(prev =>
                      prev.includes(f.uid)
                        ? prev.filter(id => id !== f.uid)
                        : [...prev, f.uid]
                    );
                  }}
                >
                  <ThemedText style={[
                    styles.participantChipText,
                    selectedPayers.includes(f.uid) && styles.participantChipTextActive
                  ]}>{f.displayName}</ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Participants Selection */}
            <ThemedText style={styles.expenseLabel}>Split With</ThemedText>
            <View style={styles.participantGrid}>
              {group.involvedFriends?.map((f) => (
                <Pressable
                  key={`participant-select-${f.uid}`}
                  style={[
                    styles.participantChip,
                    selectedParticipants.includes(f.uid) && styles.participantChipActive
                  ]}
                  onPress={() => {
                    setSelectedParticipants(prev =>
                      prev.includes(f.uid)
                        ? prev.filter(id => id !== f.uid)
                        : [...prev, f.uid]
                    );
                  }}
                >
                  <ThemedText style={[
                    styles.participantChipText,
                    selectedParticipants.includes(f.uid) && styles.participantChipTextActive
                  ]}>{f.displayName}</ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Ratio Input (only shown in ratio mode) */}
            {splitMode === 'ratio' && (
              <View style={styles.splitDetailsContainer}>
                <ThemedText style={styles.expenseLabel}>Set Ratios</ThemedText>
                {selectedParticipants.map(uid => {
                  const person = group.involvedFriends?.find(f => f.uid === uid);
                  return (
                    <View key={`ratio-${uid}`} style={styles.splitRow}>
                      <ThemedText style={styles.splitRowName}>{person?.displayName || 'Unknown'}</ThemedText>
                      <TextInput
                        style={styles.splitInput}
                        placeholder="1"
                        placeholderTextColor="#94a3b8"
                        keyboardType="decimal-pad"
                        value={ratios[uid] || ''}
                        onChangeText={(v) => setRatios(prev => ({ ...prev, [uid]: v }))}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Custom Amount Input (only shown in custom mode) */}
            {splitMode === 'custom' && (
              <View style={styles.splitDetailsContainer}>
                <ThemedText style={styles.expenseLabel}>Set Amounts (€)</ThemedText>
                {selectedParticipants.map(uid => {
                  const person = group.involvedFriends?.find(f => f.uid === uid);
                  return (
                    <View key={`custom-${uid}`} style={styles.splitRow}>
                      <ThemedText style={styles.splitRowName}>{person?.displayName || 'Unknown'}</ThemedText>
                      <TextInput
                        style={styles.splitInput}
                        placeholder="0.00"
                        placeholderTextColor="#94a3b8"
                        keyboardType="decimal-pad"
                        value={customAmounts[uid] || ''}
                        onChangeText={(v) => setCustomAmounts(prev => ({ ...prev, [uid]: v }))}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* 统一使用顶部定义的预览列表，移除底部重复的 Add Receipt 按钮 */}
            {receipts.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={{ marginBottom: 20, paddingVertical: 5 }}
              >
                {receipts.map((uri, index) => (
                  <View key={`preview-${index}`} style={{ marginRight: 12, position: 'relative' }}>
                    <Image 
                      source={{ uri }} 
                      style={{ width: 80, height: 80, borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' }} 
                    />
                    <Pressable 
                      onPress={() => setReceipts(prev => prev.filter((_, i) => i !== index))}
                      style={{ 
                        position: 'absolute', top: -8, right: -8, 
                        backgroundColor: '#ef4444', borderRadius: 12, 
                        width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
                        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2
                      }}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Save Button */}
            <Pressable style={styles.saveExpenseBtn} onPress={handleSaveExpense}>
              <ThemedText style={styles.saveExpenseBtnText}>Save Expense</ThemedText>
            </Pressable>
          </ScrollView>
        </AppScreen>
      </Modal>

      {/* 好友选择 Modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <AppScreen>
          <View style={{ marginTop: 20 }}>
            <AppTopBar title={t('step4Title')} showBack onBackPress={() => setIsModalVisible(false)} />
          </View>
          <ScrollView style={{ padding: 16 }}>
            {/* “我”的选项 - 增加了显眼的样式 */}
            {auth.currentUser && (
              <Pressable 
                style={[styles.friendSelectItem, styles.meItem]} 
                onPress={() => {
                  handleAddMember({
                    uid: auth.currentUser!.uid,
                    displayName: auth.currentUser!.displayName || "Me"
                  }, activeRole!);
                  setIsModalVisible(false);
                }}
              >
                <View style={styles.miniAvatar}>
                  <ThemedText style={styles.avatarText}>ME</ThemedText>
                </View>
                <ThemedText style={{ flex: 1, marginLeft: 12, fontWeight: 'bold', color: '#2563eb' }}>
                  Me ({auth.currentUser.displayName || "Myself"})
                </ThemedText>
                <Ionicons name="star" size={20} color="#2563eb" />
              </Pressable>
            )}
            {allFriends.map((friend) => (
              <Pressable key={friend.uid} style={styles.friendSelectItem} onPress={() => { handleAddMember(friend, activeRole!); setIsModalVisible(false); }}>
                <View style={{ width: 40, height: 40, borderRadius: 0, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{friend.displayName[0]?.toUpperCase() || 'U'}</ThemedText>
                </View>
                <ThemedText style={{ flex: 1 }}>{friend.displayName}</ThemedText>
                <Ionicons name="person-add-outline" size={20} color="#2563eb" />
              </Pressable>
            ))}
          </ScrollView>
        </AppScreen>
      </Modal>

      {/* Expense Detail Modal */}
      <Modal visible={showExpenseDetailModal} animationType="slide">
        <AppScreen>
          <View style={{ marginTop: 20 }}>
            <AppTopBar 
              title="Expense Details" 
              showBack 
              onBackPress={() => {
                setShowExpenseDetailModal(false);
                setIsEditingExpense(false);
              }}
              rightIconName={isEditingExpense ? "checkmark" : "pencil"}
              onRightIconPress={() => {
                if (isEditingExpense) {
                  // 保存编辑
                  handleSaveEditedExpense();
                } else {
                  setIsEditingExpense(true);
                  if (selectedExpense) {
                    setEditedTitle(selectedExpense.title);
                    setEditedAmount(typeof selectedExpense.amount === 'number' ? selectedExpense.amount.toString() : '0');
                    setEditedPayers(selectedExpense.payers || []);
                    setEditedParticipants(selectedExpense.participants || []);
                    setEditedCurrency((selectedExpense.currency as any) || defaultCurrency);
                    setEditedSplitMode(selectedExpense.splitMode || 'equal');
                    // 初始化 ratio 和 custom 值
                    const ratios: { [uid: string]: string } = {};
                    const customAmounts: { [uid: string]: string } = {};
                    selectedExpense.participants?.forEach(pid => {
                      const amount = selectedExpense.splits?.[pid] || 0;
                      ratios[pid] = amount.toString();
                      customAmounts[pid] = amount.toFixed(2);
                    });
                    setEditedRatios(ratios);
                    setEditedCustomAmounts(customAmounts);
                    // 初始化 receipts
                    setEditedReceipts(selectedExpense.receiptUrls || []);
                  }
                }
              }}
            />
          </View>
          {selectedExpense && (
            <ScrollView style={{ padding: 16 }}>
              {/* Expense Title */}
              <ThemedView style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 16, marginBottom: 16 }}>
                <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>Expense Name</ThemedText>
                {isEditingExpense ? (
                  <TextInput
                    style={styles.expenseInput}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    placeholder="Enter expense name"
                  />
                ) : (
                  <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>{selectedExpense.title}</ThemedText>
                )}
              </ThemedView>

              {/* Total Amount */}
              <ThemedView style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 16, marginBottom: 16 }}>
                <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>Total Amount</ThemedText>
                {isEditingExpense ? (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <TextInput
                        style={[styles.expenseInput, { flex: 1, marginRight: 12 }]}
                        value={editedAmount}
                        onChangeText={setEditedAmount}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                      />
                      <Pressable
                        onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                        style={{ flex: 0.35, borderWidth: 2, borderColor: '#2563eb', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <ThemedText style={{ fontWeight: '600', fontSize: 14, color: '#2563eb' }}>{editedCurrency}</ThemedText>
                      </Pressable>
                    </View>
                    {showCurrencyPicker && (
                      <View style={{ marginBottom: 12, paddingHorizontal: 8 }}>
                        <ThemedText style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Select Currency:</ThemedText>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {supportedCurrencies.map((curr) => (
                            <Pressable
                              key={curr}
                              onPress={() => {
                                setEditedCurrency(curr);
                                setShowCurrencyPicker(false);
                              }}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                backgroundColor: editedCurrency === curr ? '#2563eb' : '#e2e8f0',
                                borderWidth: 2,
                                borderColor: '#2563eb',
                                borderRadius: 0,
                              }}
                            >
                              <ThemedText style={{ color: editedCurrency === curr ? '#fff' : '#1e293b', fontSize: 12, fontWeight: '600' }}>{curr}</ThemedText>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <ThemedText style={{ fontSize: 20, fontWeight: '700', color: '#2563eb' }}>
                    {((currencySymbols as any)[(selectedExpense.currency as any) || 'EUR']) || selectedExpense.currency || '€'}{typeof selectedExpense.amount === 'number' ? selectedExpense.amount.toFixed(2) : '0.00'}
                  </ThemedText>
                )}
              </ThemedView>

              {/* Payers */}
              <ThemedView style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 16, marginBottom: 16 }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#1e293b', marginBottom: 12 }}>Paid By</ThemedText>
                {isEditingExpense ? (
                  <View>
                    {group?.involvedFriends?.map((friend) => (
                      <Pressable
                        key={friend.uid}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 8,
                          backgroundColor: editedPayers.includes(friend.uid) ? '#dbeafe' : '#f8f9fa',
                          paddingHorizontal: 8,
                          marginBottom: 8,
                          borderWidth: 2,
                          borderColor: editedPayers.includes(friend.uid) ? '#2563eb' : '#e2e8f0',
                        }}
                        onPress={() => {
                          if (editedPayers.includes(friend.uid)) {
                            setEditedPayers(editedPayers.filter(uid => uid !== friend.uid));
                          } else {
                            setEditedPayers([...editedPayers, friend.uid]);
                          }
                        }}
                      >
                        <View style={{ marginRight: 12 }}>
                          {renderAvatar(friend, 32)}
                        </View>
                        <ThemedText style={{ flex: 1, color: '#1e293b', fontSize: 13 }}>{friend.displayName}</ThemedText>
                        <Ionicons
                          name={editedPayers.includes(friend.uid) ? 'checkmark-circle' : 'checkmark-circle-outline'}
                          size={20}
                          color={editedPayers.includes(friend.uid) ? '#2563eb' : '#cbd5e1'}
                        />
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  selectedExpense.payers?.map((payerId) => {
                    const payer = group?.involvedFriends?.find(f => f.uid === payerId);
                    return (
                      <View key={payerId} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                        <View style={{ marginRight: 12 }}>
                          {payer && renderAvatar(payer, 32)}
                        </View>
                        <ThemedText style={{ color: '#1e293b', fontSize: 13 }}>{payer?.displayName}</ThemedText>
                      </View>
                    );
                  })
                )}
              </ThemedView>

              {/* Split Mode and Details */}
              <ThemedView style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 16, marginBottom: 16 }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#1e293b', marginBottom: 12 }}>Split Details</ThemedText>
                {isEditingExpense ? (
                  <View>
                    <View style={{ marginBottom: 12 }}>
                      <ThemedText style={{ fontSize: 10, opacity: 0.6, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase' }}>Split Mode</ThemedText>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                        {(['equal', 'ratio', 'custom'] as const).map((mode) => (
                          <Pressable
                            key={mode}
                            style={{
                              flex: 1,
                              paddingHorizontal: 8,
                              paddingVertical: 6,
                              backgroundColor: editedSplitMode === mode ? '#2563eb' : '#e2e8f0',
                              borderWidth: 2,
                              borderColor: '#2563eb',
                              borderRadius: 0,
                            }}
                            onPress={() => setEditedSplitMode(mode)}
                          >
                            <ThemedText style={{ color: editedSplitMode === mode ? '#fff' : '#1e293b', fontSize: 10, fontWeight: '600', textAlign: 'center' }}>
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                    <View>
                      <ThemedText style={{ fontSize: 10, opacity: 0.6, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase' }}>Split Details</ThemedText>
                      {group?.involvedFriends?.map((friend) => {
                        const isSelected = editedParticipants.includes(friend.uid);
                        const currentAmount = selectedExpense.splits?.[friend.uid] || 0;
                        return (
                          <View key={friend.uid}>
                            <Pressable
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 6,
                                backgroundColor: isSelected ? '#dbeafe' : '#f8f9fa',
                                paddingHorizontal: 8,
                                marginBottom: isSelected ? 4 : 4,
                                borderWidth: 2,
                                borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                              }}
                              onPress={() => {
                                if (isSelected) {
                                  setEditedParticipants(editedParticipants.filter(uid => uid !== friend.uid));
                                } else {
                                  setEditedParticipants([...editedParticipants, friend.uid]);
                                }
                              }}
                            >
                              <View style={{ marginRight: 8 }}>
                                {renderAvatar(friend, 28)}
                              </View>
                              <ThemedText style={{ flex: 1, color: '#1e293b', fontSize: 12, fontWeight: '500' }}>{friend.displayName}</ThemedText>
                              <Ionicons
                                name={isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                size={18}
                                color={isSelected ? '#2563eb' : '#cbd5e1'}
                              />
                            </Pressable>
                            {isSelected && editedSplitMode === 'ratio' && (
                              <View style={{ marginLeft: 8, marginBottom: 4, paddingLeft: 36, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <ThemedText style={{ fontSize: 10, color: '#64748b', fontWeight: '500', width: 40 }}>Ratio</ThemedText>
                                <TextInput
                                  style={[styles.expenseInput, { flex: 1, height: 28, fontSize: 11, paddingVertical: 4, paddingHorizontal: 6 }]}
                                  value={editedRatios[friend.uid] || ''}
                                  onChangeText={(text) => setEditedRatios({ ...editedRatios, [friend.uid]: text })}
                                  placeholder="1"
                                  keyboardType="decimal-pad"
                                />
                              </View>
                            )}
                            {isSelected && editedSplitMode === 'custom' && (
                              <View style={{ marginLeft: 8, marginBottom: 4, paddingLeft: 36, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <ThemedText style={{ fontSize: 10, color: '#64748b', fontWeight: '500', width: 40 }}>Amount</ThemedText>
                                <TextInput
                                  style={[styles.expenseInput, { flex: 1, height: 28, fontSize: 11, paddingVertical: 4, paddingHorizontal: 6 }]}
                                  value={editedCustomAmounts[friend.uid] || ''}
                                  onChangeText={(text) => setEditedCustomAmounts({ ...editedCustomAmounts, [friend.uid]: text })}
                                  placeholder="0.00"
                                  keyboardType="decimal-pad"
                                />
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <>
                    <ThemedText style={{ fontSize: 10, opacity: 0.6, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase' }}>Mode: {selectedExpense.splitMode ? selectedExpense.splitMode.charAt(0).toUpperCase() + selectedExpense.splitMode.slice(1) : 'Equal'}</ThemedText>
                    {selectedExpense.participants?.map((participantId) => {
                      const participant = group?.involvedFriends?.find(f => f.uid === participantId);
                      const amount = selectedExpense.splits?.[participantId] || 0;
                      let currencySymbol = '€';
                      if (selectedExpense.currency && typeof selectedExpense.currency === 'string') {
                        currencySymbol = (currencySymbols as any)[selectedExpense.currency] || '€';
                      }
                      return (
                        <View key={participantId} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ marginRight: 12 }}>
                              {participant && renderAvatar(participant, 28)}
                            </View>
                            <ThemedText style={{ color: '#1e293b', fontSize: 13 }}>{participant?.displayName}</ThemedText>
                          </View>
                          <ThemedText style={{ fontWeight: '600', color: '#2563eb', fontSize: 13 }}>{currencySymbol}{amount.toFixed(2)}</ThemedText>
                        </View>
                      );
                    })}
                  </>
                )}
              </ThemedView>

              {/* Receipts Section */}
              {isEditingExpense ? (
                /* Edit Mode Receipts */
                <ThemedView style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 16, marginTop: 16 }}>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 12, fontWeight: '600', textTransform: 'uppercase' }}>Receipts ({editedReceipts.length})</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {editedReceipts.map((url, index) => (
                      <View
                        key={index}
                        style={{
                          width: '30%',
                          aspectRatio: 1,
                          borderRadius: 0,
                          overflow: 'hidden',
                          borderWidth: 2,
                          borderColor: '#e2e8f0',
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            setViewingReceiptUrl(url);
                            setShowReceiptViewer(true);
                          }}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <Image source={{ uri: url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                        </Pressable>
                        {/* Delete Button */}
                        <Pressable
                          onPress={() => {
                            setEditedReceipts(prev => prev.filter((_, i) => i !== index));
                          }}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            borderRadius: 0,
                            padding: 4,
                          }}
                        >
                          <Ionicons name="trash" size={14} color="#fff" />
                        </Pressable>
                      </View>
                    ))}
                    {/* Add Receipt Button */}
                    <Pressable
                      onPress={async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          allowsEditing: true,
                          quality: 0.7,
                        });
                        if (!result.canceled && result.assets[0]) {
                          const imageUri = result.assets[0].uri;
                          const uploadedUrl = await uploadImageAndGetUrl(imageUri, auth.currentUser?.uid || 'unknown');
                          if (uploadedUrl) {
                            setEditedReceipts(prev => [...prev, uploadedUrl]);
                          }
                        }
                      }}
                      style={{
                        width: '30%',
                        aspectRatio: 1,
                        borderRadius: 0,
                        borderWidth: 2,
                        borderColor: '#2563eb',
                        borderStyle: 'dashed',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f0f7ff',
                      }}
                    >
                      <Ionicons name="add" size={28} color="#2563eb" />
                      <ThemedText style={{ fontSize: 10, color: '#2563eb', marginTop: 4 }}>Add</ThemedText>
                    </Pressable>
                  </View>
                </ThemedView>
              ) : (
                /* View Mode Receipts */
                selectedExpense.receiptUrls && selectedExpense.receiptUrls.length > 0 && (
                  <ThemedView style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', padding: 16, marginTop: 16 }}>
                    <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 12, fontWeight: '600', textTransform: 'uppercase' }}>Receipts ({selectedExpense.receiptUrls.length})</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {selectedExpense.receiptUrls.map((url, index) => (
                        <Pressable
                          key={index}
                          onPress={() => {
                            setViewingReceiptUrl(url);
                            setShowReceiptViewer(true);
                          }}
                          style={{
                            width: '30%',
                            aspectRatio: 1,
                            borderRadius: 0,
                            overflow: 'hidden',
                            borderWidth: 2,
                            borderColor: '#e2e8f0',
                          }}
                        >
                          <Image source={{ uri: url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                          <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(37, 99, 235, 0.9)', borderRadius: 0, padding: 4 }}>
                            <Ionicons name="expand" size={12} color="#fff" />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </ThemedView>
                )
              )}
              {/* 原文：Receipts Section 渲染完毕后 */}
              {/* --- 新增删除按钮区域 --- */}
              {/* 确保 isEditingExpense 逻辑块内结构清晰 */}
              {/* --- 新增删除按钮区域 --- */}
              {/* --- 新增删除按钮区域 --- */}
              {isEditingExpense && (
                <View style={{ marginTop: 30, paddingHorizontal: 4, marginBottom: 40 }}>
                  <Pressable 
                    onPress={handleDeleteExpense}
                    // 使用 Pressable 配合 style 函数来实现点击反馈，规避 TS 错误
                    style={({ pressed }) => [
                      {
                        backgroundColor: '#fff1f2',
                        paddingVertical: 16,
                        borderWidth: 2,
                        borderColor: '#fecaca',
                        alignItems: 'center',
                        opacity: pressed ? 0.6 : 1, // 实现类似 TouchableOpacity 的效果
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="trash-outline" size={20} color="#e11d48" style={{ marginRight: 8 }} />
                      {/* 强制使用 ThemedText 保证样式和类型一致 */}
                      <ThemedText style={{ color: '#e11d48', fontWeight: '700', fontSize: 16 }}>
                        DELETE EXPENSE
                      </ThemedText>
                    </View>
                  </Pressable>
                  
                  <ThemedText style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
                    Once deleted, the group balance will be recalculated.
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          )}
          
          {/* Receipt Fullscreen Viewer - 内部弹窗 */}
          {showReceiptViewer && viewingReceiptUrl && (
            <Pressable 
              onPress={() => setShowReceiptViewer(false)}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.95)', 
                justifyContent: 'center', 
                alignItems: 'center',
                zIndex: 999
              }}
            >
              <Pressable
                onPress={() => setShowReceiptViewer(false)}
                style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <Image
                source={{ uri: viewingReceiptUrl }}
                style={{ width: '90%', height: '80%', resizeMode: 'contain' }}
              />
            </Pressable>
          )}
        </AppScreen>
      </Modal>

      {/* 日期选择 Modal - 分开年月日 */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowDatePicker(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>Select Date</ThemedText>
            <Pressable onPress={() => setShowDatePicker(false)}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </Pressable>
          </View>

          {/* 年月日选择器 */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
            {/* 年份选择 */}
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: '600' }}>Year</ThemedText>
              <ScrollView style={{ maxHeight: 150, borderWidth: 2, borderColor: '#2563eb', borderRadius: 0 }}>
                {generateYears().map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: selectedYear === year ? '#dbeafe' : '#fff',
                      borderBottomWidth: 1,
                      borderBottomColor: '#e2e8f0',
                    }}
                  >
                    <ThemedText style={{ 
                      textAlign: 'center', 
                      color: selectedYear === year ? '#2563eb' : '#64748b',
                      fontWeight: selectedYear === year ? '600' : 'normal'
                    }}>
                      {year}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* 月份选择 */}
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: '600' }}>Month</ThemedText>
              <ScrollView style={{ maxHeight: 150, borderWidth: 2, borderColor: '#2563eb', borderRadius: 0 }}>
                {generateMonths().map((month) => (
                  <Pressable
                    key={month}
                    onPress={() => setSelectedMonth(month)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: selectedMonth === month ? '#dbeafe' : '#fff',
                      borderBottomWidth: 1,
                      borderBottomColor: '#e2e8f0',
                    }}
                  >
                    <ThemedText style={{ 
                      textAlign: 'center', 
                      color: selectedMonth === month ? '#2563eb' : '#64748b',
                      fontWeight: selectedMonth === month ? '600' : 'normal'
                    }}>
                      {month.toString().padStart(2, '0')}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* 日期选择 */}
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: '600' }}>Day</ThemedText>
              <ScrollView style={{ maxHeight: 150, borderWidth: 2, borderColor: '#2563eb', borderRadius: 0 }}>
                {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: selectedDay === day ? '#dbeafe' : '#fff',
                      borderBottomWidth: 1,
                      borderBottomColor: '#e2e8f0',
                    }}
                  >
                    <ThemedText style={{ 
                      textAlign: 'center', 
                      color: selectedDay === day ? '#2563eb' : '#64748b',
                      fontWeight: selectedDay === day ? '600' : 'normal'
                    }}>
                      {day.toString().padStart(2, '0')}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 预览和确认按钮 */}
          <View style={{ backgroundColor: '#f0f7ff', borderWidth: 2, borderColor: '#2563eb', borderRadius: 0, padding: 12, marginBottom: 16 }}>
            <ThemedText style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>Selected Date:</ThemedText>
            <ThemedText style={{ color: '#2563eb', fontSize: 16, fontWeight: '700' }}>
              {new Date(selectedYear, selectedMonth - 1, selectedDay).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => setShowDatePicker(false)}
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#cbd5e1', borderRadius: 0, alignItems: 'center' }}
            >
              <ThemedText style={{ color: '#1e293b', fontWeight: '600' }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleUpdateDate}
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#2563eb', borderWidth: 2, borderColor: '#1e40af', borderRadius: 0, alignItems: 'center' }}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Confirm</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerCard: { padding: 20, borderRadius: 0, backgroundColor: '#2563eb', alignItems: 'center', marginVertical: 10, borderWidth: 3, borderColor: '#1e40af' },
  idBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 0, marginBottom: 12 },
  idBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'monospace' },
  dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  totalAmount: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 8 },
  totalLabel: { color: '#fff', opacity: 0.8, fontSize: 14 },
  sectionTitle: { marginTop: 24, marginBottom: 12 },
  
  // Tab 样式 - 像素风
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 0,
    padding: 4,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 0,
  },
  activeTab: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#1e293b',
  },
  
  // 成员区域 - 像素风
  roleContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 0,
    padding: 16, 
    borderWidth: 2, 
    borderTopWidth: 0,
    borderColor: '#60a5fa' 
  },
  memberContent: {
    minHeight: 80,
  },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 4, 
    paddingRight: 8, 
    paddingVertical: 6, 
    borderRadius: 0, 
    backgroundColor: '#f0f7ff', 
    borderWidth: 2, 
    borderColor: '#2563eb',
  },
  ownerChip: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
  payerChip: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownerText: { color: '#b45309', fontSize: 13, fontWeight: '600' },
  payerText: { color: '#15803d', fontSize: 13, fontWeight: '600' },
  chipText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  amountBadge: { 
    backgroundColor: '#22c55e', 
    marginLeft: 6, 
    paddingHorizontal: 6, 
    paddingVertical: 2,
    borderRadius: 0 
  },
  amountBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  deleteBtn: { marginLeft: 4, padding: 2 },
  addMemberChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 0, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#d1d5db',
    gap: 4,
  },
  addMemberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  friendSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 0,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  meItem: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
  },
  miniAvatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 0, 
    backgroundColor: '#2563eb', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatarText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  
  // Add Expense 样式 - 像素风
  addExpenseBtn: {
    backgroundColor: '#2563eb',
    borderWidth: 3,
    borderColor: '#1e40af',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  addExpenseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  expenseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  expenseInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#60a5fa',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  splitModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  splitModeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 0,
  },
  splitModeBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1e40af',
  },
  splitModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  splitModeTextActive: {
    color: '#fff',
  },
  participantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 0,
  },
  participantChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  participantChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  participantChipTextActive: {
    color: '#1e40af',
  },
  splitDetailsContainer: {
    marginTop: 8,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 0,
  },
  splitRowName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  splitInput: {
    width: 80,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#60a5fa',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#1e293b',
  },
  previewContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 0,
    padding: 16,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#166534',
  },
  receiptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  receiptThumbnail: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  addReceiptBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'solid',
    backgroundColor: '#ffffff',
  },
  saveExpenseBtn: {
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#15803d',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveExpenseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteSection: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});