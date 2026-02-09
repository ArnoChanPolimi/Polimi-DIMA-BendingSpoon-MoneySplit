// app\(tabs)\quick-add.tsx
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useThemeColor } from '@/hooks/use-theme-color'; // 补上这个，否则 useThemeColor 报错
import { auth, db, uploadImageAndGetUrl } from '@/services/firebase';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
// import defaultFriends from '../../assets/data/friends.json';
import { ParticipantSection } from "@/components/expense/ParticipantSection";

import * as ImagePicker from 'expo-image-picker';


export default function QuickAddScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [amount, setAmount] = useState('');
  const [receipts, setReceipts] = useState<string[]>([]);
  // 存放从 Firebase 捞出来的真实好友
  const [realFriends, setRealFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); 
  const [processStep, setProcessStep] = useState<string>(''); 
  const [nameError, setNameError] = useState(false); 
  // 控制“添加好友”弹窗的显示/隐藏
  const [showAddPeople, setShowAddPeople] = useState(false);

  // 你的新“双轨制”状态
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);      // 谁付钱
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]); // 谁分摊
  const [targetType, setTargetType] = useState<'payer' | 'participant'>('payer');

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

  // 选图逻辑
  const pickImage = async () => {
    // 规则：Web 端不请求权限，防止 "Receiving end does not exist" 报错
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert("Permission denied!");
        return;
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      console.log("QuickAdd Picker Result:", result);

      if (!result.canceled && result.assets) {
        const newUri = result.assets[0].uri;
        setReceipts(prev => [...prev, newUri]); // 累加图片
      }
    } catch (err) {
      console.error("Image pick failed:", err);
    }
  };

  const handleSave = async () => {
    setNameError(false);
    setProcessStep('');

    // 第一关：基础必填项检查
    if (!groupName.trim() || !amount) {
      if (!groupName.trim()) setNameError(true);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // 第二关：核心数据检查（你要加的是这一段，它是独立的！）
    if ((selectedPayers.length > 0 || selectedParticipants.length > 0) && realFriends.length === 0) {
      Alert.alert("Wait", "Friends list is still loading, please try again.");
      return;
    }

    setLoading(true);
    setProcessStep('Step 1: Connecting...'); 

    const myUid = auth.currentUser?.uid || "anon";
    const trimmedName = groupName.trim();

    try {
      // 1. 生成唯一 ID (这是文件夹的名字)
      const uniqueBillId = generateBillId(); 

      // 2. 多图上传逻辑 (只写一遍！)
      let uploadedUrls: string[] = [];
      if (receipts.length > 0) {
        setProcessStep(`Step 2: Uploading ${receipts.length} images...`);
        // 并行上传
        uploadedUrls = await Promise.all(
          receipts.map(uri => uploadImageAndGetUrl(uri, uniqueBillId))
        );
      }

      // 3. 查重
      setProcessStep('Step 3: Checking name uniqueness...');
      const groupsRef = collection(db, "groups");
      const nameQuery = query(groupsRef, where("name", "==", trimmedName));
      const querySnapshot = await getDocs(nameQuery);

      if (!querySnapshot.empty) {
        setLoading(false);
        setNameError(true);
        setProcessStep('Duplicate Name!'); 
        return; 
      }

      // 4. 保存到 Cloud
      setProcessStep('Step 4: Saving...');

      const allUniqueIds = Array.from(new Set([myUid, ...selectedPayers, ...selectedParticipants]));
      
      const finalFriendsData = realFriends
        .filter(f => allUniqueIds.includes(f.uid))
        .map(f => ({ 
          uid: f.uid, 
          displayName: f.displayName || f.email || "Unknown" 
        }));

      const finalFriendsWithMe = [
        { uid: myUid, displayName: auth.currentUser?.displayName || "Me" },
        ...finalFriendsData
      ];  

      const groupDocRef = doc(db, "groups", uniqueBillId);

      await setDoc(groupDocRef, {
        id: uniqueBillId,         
        name: trimmedName,        
        totalExpenses: parseFloat(amount),
        ownerId: myUid, 
        payerIds: selectedPayers.length > 0 ? selectedPayers : [myUid],
        participantIds: allUniqueIds, // 
        involvedFriends: finalFriendsWithMe, 
        updatedAt: Date.now(),
        status: 'ongoing',
        startDate: new Date().toISOString().split('T')[0],
        receiptUrls: uploadedUrls 
      });
      // 1. 在 setDoc 之后插入
      setProcessStep('Step 5: Notifying Friends...');

      const currentUserName = auth.currentUser?.displayName || "A friend";

      // 2. 为每个好友创建一条通知
      const notificationPromises = allUniqueIds
        .filter((uid: string) => uid !== myUid) // 显式加上类型
        .map((friendUid: string) => {           // 显式加上类型
          // 往全局 notifications 集合写数据，触发对方首页监听
          const notifRef = doc(collection(db, "notifications")); 
          return setDoc(notifRef, {
            to: friendUid,
            fromId: myUid,
            fromName: currentUserName,
            type: "new_group",    // 标记这是新账单通知
            groupName: trimmedName,
            groupId: uniqueBillId,
            status: "unread",     // 初始状态为未读，用于显示红点
            createdAt: Date.now()
          });
        });

      await Promise.all(notificationPromises);
      setProcessStep('Success!');
      setTimeout(() => {
        // 1. 清空所有状态
        setGroupName('');
        setAmount('');
        setSelectedPayers([]);
        setSelectedParticipants([]);
        setReceipts([]);
        setLoading(false);
        setProcessStep('');
        
        // 2. 再执行跳转
        router.replace('/(tabs)');
      }, 500);

    } catch (e: any) {
      setLoading(false);
      setProcessStep('Failed');
      Alert.alert("Error", "Check your connection.");
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
      <AppTopBar title="New Expense" />
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
        {/* 支付者区域 */}
        {/* 支付者区域 */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>2 · Who Paid? (Payers)</ThemedText>
        <View style={styles.participantContainer}> 
          <ParticipantSection 
            selectedFriends={realFriends.filter(f => selectedPayers.includes(f.uid))}
            participantIds={selectedPayers} 
            onToggle={(uid) => setSelectedPayers(prev => prev.filter(id => id !== uid))}
            onAddPress={() => {
              setTargetType('payer'); 
              setShowAddPeople(true);
            }} 
            // 注意：不要在外面再包裹任何带有 "2. Participants" 字样的组件
          />
        </View>

        {/* 分摊参与者区域 */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>3 · Who Splits? (Participants)</ThemedText>
        <View style={styles.participantContainer}> 
          <ParticipantSection 
            selectedFriends={realFriends.filter(f => selectedParticipants.includes(f.uid))}
            participantIds={selectedParticipants} 
            onToggle={(uid) => setSelectedParticipants(prev => prev.filter(id => id !== uid))}
            onAddPress={() => {
              setTargetType('participant');
              setShowAddPeople(true);
            }} 
          />
        </View>

        <ThemedText type="subtitle" style={{ marginTop: 16 }}>4 · Total Budget</ThemedText>
        <TextInput 
          style={styles.input} 
          value={amount} 
          onChangeText={setAmount} 
          keyboardType="numeric" 
          placeholder="0.00" 
          editable={!loading}
        />
        <ThemedText type="subtitle" style={styles.sectionTitle}>5 · Receipt (Optional)</ThemedText>
        {/* 1. 图片预览区域 */}
        {/* A. 预览区域：放在标题下方 */}
        <View style={styles.previewList}>
          {receipts.map((uri, index) => (
            <View key={index} style={styles.thumbnailContainer}>
              <Image source={{ uri }} style={styles.thumbnail} />
              {/* 增加删除按键，点击触发 filter 过滤掉该索引的图 */}
              <Pressable 
                style={styles.deleteBadge} 
                onPress={() => setReceipts(prev => prev.filter((_, i) => i !== index))}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable 
          style={({ pressed }) => [
            styles.receiptBox, 
            { opacity: pressed ? 0.7 : 1 },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
          ]} 
          onPress={pickImage} 
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#64748b" />
          <ThemedText style={{ color: '#64748b', marginLeft: 8 }}>
            {receipts.length > 0 ? "Add More Receipts" : "Upload Receipt"}
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
                        const setter = targetType === 'payer' ? setSelectedPayers : setSelectedParticipants;
                        setter(prev => prev.includes(f.uid) ? prev.filter(u => u !== f.uid) : [...prev, f.uid]);
                      }}
                      style={styles.modalRow}
                    >
                      <ThemedText style={{ flex: 1 }}>{f.displayName || f.email}</ThemedText>
                      { (targetType === 'payer' ? selectedPayers : selectedParticipants).includes(f.uid) && 
                        <Ionicons name="checkmark" size={20} color="#2563eb" /> 
                      }
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
    paddingVertical: 20,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60, // 加上这个，防止组件缩成一团
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
  previewList: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginTop: 10 
  },
  thumbnailContainer: { 
    width: 80, 
    height: 80, 
    position: 'relative' 
  },
  thumbnail: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  deleteBadge: { 
    position: 'absolute', // 必须有这个
    top: -5,              // 向上偏一点
    right: -5,            // 向右偏一点
    backgroundColor: '#fff', 
    borderRadius: 10,
    zIndex: 10            // 确保不被图片遮住
  },
  uploadBtn: {
    marginTop: 12,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
});