// app\(tabs)\quick-add.tsx
import { auth, db } from '@/services/firebase';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';

import defaultFriends from '../../assets/data/friends.json';

export default function QuickAddScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); 
  const [processStep, setProcessStep] = useState<string>(''); 
  const [nameError, setNameError] = useState(false); 

  const generateBillId = () => {
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GB-${datePart}-${randomPart}`;
  };

  const handleSave = async () => {
    setNameError(false);
    setProcessStep('');

    if (!groupName.trim() || !amount) {
      if (!groupName.trim()) setNameError(true);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    setProcessStep('Step 1: Connecting...'); 

    const myUid = auth.currentUser?.uid || "anon";
    const trimmedName = groupName.trim();

    try {
      setProcessStep('Step 2: Checking name uniqueness...');
      const groupsRef = collection(db, "groups");
      const nameQuery = query(groupsRef, where("name", "==", trimmedName));
      const querySnapshot = await getDocs(nameQuery);

      if (!querySnapshot.empty) {
        setLoading(false);
        setNameError(true);
        setProcessStep('Duplicate Name: Already Exists!'); 
        return; 
      }

      setProcessStep('Step 3: Saving to Cloud...');
      const uniqueBillId = generateBillId(); 
      const finalDocRef = doc(db, "groups", uniqueBillId); 

      // 【核心修复】：动脑子处理数据结构，防止 index.tsx 崩溃
      // 把选中的字符串数组 ['john'] 转换成对象数组 [{username: 'john', displayName: '...'}]
      const friendsData = selected.map(uname => {
        const friendObj = (defaultFriends as any[]).find(f => f.username === uname);
        return {
          username: uname,
          displayName: friendObj?.displayName || uname
        };
      });

      await setDoc(finalDocRef, {
        id: uniqueBillId,         
        name: trimmedName,        
        totalExpenses: parseFloat(amount),
        ownerId: myUid,
        updatedAt: Date.now(),
        status: 'ongoing', // 新增：给主页 status.toUpperCase() 提供初始值
        startDate: new Date().toISOString().split('T')[0], // 新增：对齐主页的日期显示
        involvedFriends: friendsData 
      });

      setProcessStep('Step 4: Success!');
      setTimeout(() => {
        setLoading(false);
        setProcessStep('');
        router.replace('/(tabs)');
      }, 500);

    } 
    catch (e: any) {
      setLoading(false);
      setProcessStep('Connection Failed');
      Alert.alert("Error", "Check your internet connection.");
    }
  };

  // ✅ 主题色只算一次（不在每个 Chip 里算）
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");

  // 选中态颜色（保持你原有设计）
  const selectedBg = "#2563eb";
  const selectedBorder = "#2563eb";

  const peopleText = selected
    .map((id) => (id === "you" ? t("you") : id))
    .join(", ");

  return (
    <AppScreen>
      <AppTopBar title="New Expense Group" />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle" style={nameError ? { color: '#ef4444' } : {}}>
          1 · Group Name {nameError && "(Already Exists!)"}
        </ThemedText>
        <TextInput 
          style={[styles.input, nameError && styles.inputError]} 
          value={groupName} 
          onChangeText={(text) => {
            setGroupName(text);
            if (nameError) setNameError(false);
          }} 
          placeholder="e.g. Milano Pizza" 
          editable={!loading}
        />

        <ThemedText type="subtitle" style={{ marginTop: 16 }}>2 · Involve Friends</ThemedText>
        <View style={styles.chipRow}>
          {(defaultFriends as any[]).map((f) => (
            <Pressable 
              key={f.username} 
              onPress={() => !loading && setSelected(prev => 
                prev.includes(f.username) ? prev.filter(u => u !== f.username) : [...prev, f.username]
              )}
              style={[styles.chip, selected.includes(f.username) && styles.chipSelected]}
            >
              <ThemedText style={selected.includes(f.username) ? {color: 'white'} : {}}>
                {f.displayName}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="subtitle" style={{ marginTop: 16 }}>3 · Total Budget</ThemedText>
        <TextInput 
          style={styles.input} 
          value={amount} 
          onChangeText={setAmount} 
          keyboardType="numeric" 
          placeholder="0.00" 
          editable={!loading}
        />

        <View style={{ height: 32 }} />
        
        <PrimaryButton 
          label="Confirm & Generate Bill" 
          onPress={handleSave} 
          disabled={loading}
          loading={loading}
          processStep={processStep}
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, paddingHorizontal: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginTop: 8, backgroundColor: '#fff'
  },
  inputError: { 
    borderColor: '#ef4444', 
    borderWidth: 2, 
    backgroundColor: '#fff5f5' 
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff'
  },
  chipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
});