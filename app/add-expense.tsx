// app/add-expense.tsx
// 从app/group/[groupId]/add-expense.tsx 迁移到 // app/add-expense.tsx
import { ParticipantSection } from "@/components/expense/ParticipantSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { t } from "@/core/i18n";
import { useSettings } from "@/core/settings/SettingsContext";
import { useCurrency } from "@/core/currency/CurrencyContext";
import { auth, db, uploadImageAndGetUrl } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import { Currency } from "@/services/exchangeRateApi";

type FriendRecord = {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  addedAt: number;
};

export default function AddExpenseScreen() {
  // const { groupId } = useLocalSearchParams();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const router = useRouter();
  const { language } = useSettings();
  const { defaultCurrency, convertAmount } = useCurrency();

  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(defaultCurrency);

  const [friends, setFriends] = useState<FriendRecord[]>([]);
  // 应该改为（默认只选你自己）：
  const [participantIds, setParticipantIds] = useState<string[]>(
    auth.currentUser?.uid ? [auth.currentUser.uid] : []
  );

  const [showAddPeople, setShowAddPeople] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  

  useEffect(() => {
    const loadFriendsFromDb = async () => {
      const myUid = auth.currentUser?.uid;
      if (!myUid) return;

      try {
        const friendsRef = collection(db, "users", myUid, "friends");
        const snapshot = await getDocs(friendsRef);
        
        const fetchedFriends = snapshot.docs.map(d => {
          const data = d.data();
          // 强制 trim() 掉可能存在的空格，并确保 uid 一定存在
          const actualUid = (data.uid || d.id).trim(); 
          return {
            uid: actualUid,
            displayName: data.displayName || "Unknown",
            username: data.username || "user",
            avatar: "", // 彻底不管它
            addedAt: Number(data.addedAt) || Date.now()
          } as FriendRecord;
        });

        // Logic: Always include the current user to satisfy the participantIds filter
        const me: FriendRecord = {
          uid: myUid,
          displayName: "Me",
          username: "me",
          avatar: "https://ui-avatars.com/api/?name=Me",
          addedAt: Date.now()
        };

        setFriends([me, ...fetchedFriends]);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    loadFriendsFromDb();
  }, []);

  // 1. 定义可选的图片状态
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  // 2. 选图逻辑：仅当用户点击时触发
  const pickImage = async () => {
    // 1. 主动请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert("Permission denied! Please allow access to your photos in settings.");
      return;
    }

    // 2. 打开相册
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 明确指定只选图片
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log("Picker Result:", result); // 检查结果

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const toggleParticipant = (friendUid: string) => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    // 统一对传入的 ID 进行清洗
    const cleanFriendUid = friendUid.trim();
    const cleanMyUid = myUid.trim();

    setParticipantIds((prev) => {
      // 检查时也清洗数组内部的 ID
      const isExist = prev.map(id => id.trim()).includes(cleanFriendUid);

      if (isExist) {
        if (cleanFriendUid === cleanMyUid) return prev; 
        return prev.filter((id) => id.trim() !== cleanFriendUid);
      } else {
        return [...prev, cleanFriendUid];
      }
    });
  };

  const handleSave = async () => {
    const amountNum = parseFloat(totalAmount);
    
    // 1. 基础合法性校验
    if (!title || isNaN(amountNum)) {
      alert("Please enter a valid title and amount");
      return;
    }

    const myUid = auth.currentUser?.uid;
    if (!myUid) {
      alert("Please log in first");
      return;
    }

    try {
      // --- 核心优化逻辑：处理小票上传 ---
      let finalReceiptUrl = "";

      if (receiptImage) {
        try {
          finalReceiptUrl = await uploadImageAndGetUrl(receiptImage, myUid);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Receipt image upload failed, but we'll save the expense details.");
        }
      }

      // --- 🔥 关键修复：确保“我”永远在参与者名单里 ---
      // 理由：如果不包含自己，首页的 participantIds 过滤逻辑会直接隐藏这条账单
      const cleanMyUid = myUid.trim();
      const finalParticipantIds = Array.from(new Set([
        ...participantIds.map(id => id.trim()), 
        cleanMyUid
      ]));

      // --- Currency Conversion Logic ---
      let convertedAmount = amountNum;
      if (selectedCurrency !== defaultCurrency) {
        const result = await convertAmount(amountNum, selectedCurrency, defaultCurrency);
        if (result !== null) {
          convertedAmount = result;
        } else {
          // API failed, use original amount as fallback
          convertedAmount = amountNum;
          console.warn(`Currency conversion failed for ${selectedCurrency} to ${defaultCurrency}`);
        }
      }

      // 2. 确定存储路径
      const collectionPath = groupId 
        ? collection(db, "groups", groupId as string, "expenses") 
        : collection(db, "users", myUid, "personal_expenses");

      // 3. 执行写入
      await addDoc(collectionPath, {
        title,
        amount: convertedAmount, // Store converted amount in default currency
        originalAmount: amountNum, // Store original amount with its currency
        originalCurrency: selectedCurrency, // Store the currency it was recorded in
        payerId: cleanMyUid, // 确保支付者是当前用户
        participants: finalParticipantIds, // 🔑 使用强制包含了自己的新数组
        notes: notes,
        receiptUrl: finalReceiptUrl,
        createdAt: Date.now(),
      });

      alert("Expense saved!");
      router.back();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save expense. Please try again.");
    }
  };

  // 刷新表单
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTitle('');
    setTotalAmount('');
    setNotes('');
    setParticipantIds(auth.currentUser?.uid ? [auth.currentUser.uid] : []);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <AppScreen>
      <AppTopBar 
        title={t("newExpense")} 
        showBack 
        showRefresh={true}
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">{t("step1Title")}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t("expenseNamePlaceholder")}
            value={title}
            onChangeText={setTitle}
          />

          <ParticipantSection 
            // 这里的 includes 也要加 trim()，否则主页面圆圈还是出不来！
            selectedFriends={friends.filter((f) => 
              participantIds.map(id => id.trim()).includes(f.uid.trim())
            )} 
            participantIds={participantIds}
            onToggle={toggleParticipant}
            onAddPress={() => setShowAddPeople(true)}
          />

          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">{t("step2Title")}</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder={t("amountPlaceholder")}
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelectCurrency={setSelectedCurrency}
              label={t("recordCurrency")}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">{t("notesOptionalTitle")}</ThemedText>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              placeholder={t("notesPlaceholder")}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
          
          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">4 · {t("receipts")}</ThemedText>
            
            <Pressable 
              onPress={() => {
                // console.log("Upload area pressed!"); 
                alert("Triggered!");
                pickImage();
              }}
              // FIX 1: 增加 hitSlop，扩大点击判定范围，防止边缘点不到
              hitSlop={20} 
              style={({ pressed }) => [
                styles.uploadArea,
                // FIX 2: 增加背景色反馈，让你肉眼能确认到底点中没
                { backgroundColor: pressed ? '#f3f4f6' : '#f9fafb', opacity: pressed ? 0.7 : 1 }, 
                receiptImage ? { padding: 0 } : null
              ]}
            >
              {receiptImage ? (
                <Image source={{ uri: receiptImage }} style={styles.previewImage} />
              ) : (
                /* FIX 3: 彻底删掉 pointerEvents: 'none'，让它变回正常的 View */
                <View style={{ alignItems: 'center' }}> 
                  <Ionicons name="cloud-upload-outline" size={28} color="#9ca3af" />
                  <ThemedText style={{ color: '#9ca3af', marginTop: 4 }}>{t("receipts")}</ThemedText>
                </View>
              )}
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
          <PrimaryButton label={t("addExpense")} onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showAddPeople} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold">{t("step4Title")}</ThemedText>
              <Pressable onPress={() => { setShowAddPeople(false); setInviteSearch(""); }}>
                <Ionicons name="close" size={20} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {/* 1. 过滤掉自己后的好友列表逻辑 */}
              {friends.filter(f => f.uid !== auth.currentUser?.uid).length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ThemedText style={{ color: '#9ca3af' }}>{t("noFriends") || "You don't have any friends"}</ThemedText>
                </View>
              ) : (
                friends.map((friend) => (
                  <Pressable key={friend.uid} onPress={() => toggleParticipant(friend.uid)}>
                    <ThemedView style={styles.modalRow}>
                      
                      {/* 2. 核心改动：不再使用 Image 标签，直接显示首字母 */}
                      <View style={[styles.avatarCircle, { backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }]}>
                        <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                          {(friend.displayName || "U").charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>

                      <ThemedText style={{ flex: 1 }}>{friend.displayName}</ThemedText>

                      {/* 3. 勾选逻辑 */}
                      {participantIds.map(id => id.trim()).includes(friend.uid.trim()) && (
                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                      )}
                    </ThemedView>
                  </Pressable>
                ))
              )}
            </ScrollView>
            <PrimaryButton label="Done" onPress={() => setShowAddPeople(false)} />
          </ThemedView>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  input: { borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", padding: 10, marginTop: 8, backgroundColor: "white" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 8 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 10 },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#e5e7eb" },
  uploadArea: {
    marginTop: 8,
    height: 120, // 至少给 100-150 的高度
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});