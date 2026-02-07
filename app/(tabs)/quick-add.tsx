// app\(tabs)\quick-add.tsx
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useThemeColor } from '@/hooks/use-theme-color'; // 补上这个，否则 useThemeColor 报错
import { auth, db } from '@/services/firebase';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
// import defaultFriends from '../../assets/data/friends.json';
import { ParticipantSection } from "@/components/expense/ParticipantSection";

export default function QuickAddScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<string | null>(null); // 补回小票状态
  // 存放从 Firebase 捞出来的真实好友
  const [realFriends, setRealFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); 
  const [processStep, setProcessStep] = useState<string>(''); 
  const [nameError, setNameError] = useState(false); 
  // 控制“添加好友”弹窗的显示/隐藏
  const [showAddPeople, setShowAddPeople] = useState(false);
  // 增加一个 Effect 逻辑，去 Firebase 捞真人
  useEffect(() => {
    const loadRemoteFriends = async () => {
      const myUid = auth.currentUser?.uid;
      if (!myUid) return;

      console.log("Fetching friends for:", myUid); // 加上 Log 让你能看到它在动
      const snap = await getDocs(collection(db, "users", myUid, "friends"));
      const list = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setRealFriends(list);
    };
    loadRemoteFriends();
  }, [auth.currentUser?.uid, showAddPeople]); // 重点：当弹窗打开时，强制再刷一次，确保不丢人

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
      const friendsData = selected.map(uid => {
        const friendObj = realFriends.find(f => f.uid === uid);
        return {
          uid: uid,
          displayName: friendObj?.displayName || friendObj?.email || "Unknown"
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

  // 主题色只算一次（不在每个 Chip 里算）
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");

  // 选中态颜色（保持你原有设计）
  const selectedBg = "#2563eb";
  const selectedBorder = "#2563eb";

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

        <View style={styles.participantContainer}> 
          <ParticipantSection 
            selectedFriends={realFriends.filter(f => selected.includes(f.uid))}
            participantIds={selected} 
            onToggle={(uid) => setSelected(prev => prev.filter(id => id !== uid))}
            onAddPress={() => setShowAddPeople(true)} 
          />
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
        <ThemedText type="subtitle" style={styles.sectionTitle}>4 · Receipt (Optional)</ThemedText>
        <Pressable 
          style={styles.receiptBox} 
          onPress={() => {/* 这里接你的图片选择逻辑 */}}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#64748b" />
          <ThemedText style={{ color: '#64748b', marginLeft: 8 }}>
            {receipt ? "Image Selected" : "Upload Receipt"}
          </ThemedText>
        </Pressable>

        <View style={{ height: 32 }} />
        
        <PrimaryButton 
          label="Confirm & Generate Bill" 
          onPress={handleSave} 
          disabled={loading}
          loading={loading}
          processStep={processStep}
        />
      </ScrollView>
      {/* 1. 新增弹窗逻辑：用于响应点击 Add 后的操作 */}
        <Modal visible={showAddPeople} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText type="subtitle" style={{ marginBottom: 15 }}>Select Friends</ThemedText>
              <ScrollView style={{ maxHeight: 300 }}>
                {realFriends.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ThemedText style={{ color: '#94a3b8' }}>Loading or No Friends Found...</ThemedText>
                  </View>
                ) : (
                  realFriends.map(f => (
                    <Pressable 
                      key={f.uid} 
                      onPress={() => {
                        setSelected(prev => 
                          prev.includes(f.uid) ? prev.filter(u => u !== f.uid) : [...prev, f.uid]
                        );
                      }}
                      style={styles.modalRow}
                    >
                      <ThemedText style={{ flex: 1 }}>{f.displayName || f.email}</ThemedText>
                      {selected.includes(f.uid) && <Ionicons name="checkmark" size={20} color="#2563eb" />}
                    </Pressable>
                  ))
                )}
              </ScrollView>
              <PrimaryButton label="Done" onPress={() => setShowAddPeople(false)} />
            </View>
          </View>
        </Modal>
    </AppScreen>
  );
  
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { marginTop: 24, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, // 增加圆角
    paddingHorizontal: 16, paddingVertical: 12, marginTop: 8, 
    backgroundColor: '#fff', fontSize: 16
  },
  participantContainer: {
    // 删掉固定高度，改用内边距控制
    paddingVertical: 10,
    marginTop: 0, // 减少顶部间距，解决你标题重叠后的视觉断层
    flexDirection: 'row', // 确保横向排列
    alignItems: 'center',
  },
  receiptBox: {
    marginTop: 10, height: 60, borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f8fafc'
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
});