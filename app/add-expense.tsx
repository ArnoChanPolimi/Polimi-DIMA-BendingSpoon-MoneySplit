// app/add-expense.tsx
// 从app/group/[groupId]/add-expense.tsx 迁移到 // app/add-expense.tsx
import { ParticipantSection } from "@/components/expense/ParticipantSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useCurrency } from "@/core/currency/CurrencyContext";
import { t } from "@/core/i18n";
import { useSettings } from "@/core/settings/SettingsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Currency } from "@/services/exchangeRateApi";
import { auth, uploadImageAndGetUrl, db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc } from "firebase/firestore";

  // 新增：小票图片本地预览和上传
  const [attachmentImage, setAttachmentImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 选择图片并本地预览
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("We need camera roll permissions to upload attachments.");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachmentImage(result.assets[0].uri);
      }
    } catch (e) {
      alert("Failed to pick image");
    }
  };
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

type FriendRecord = {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  addedAt: number;
};

export default function AddExpenseScreen() {
  // hooks 必须全部放在函数体顶部
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

  // 新增：附件图片本地预览和上传
  const [attachmentImage, setAttachmentImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);


  const themedTextColor = useThemeColor({}, "text");
  useEffect(() => {
    // ...existing code for loading friends from db...
  }, []);



  useEffect(() => {
    // ...existing code for loading friends from db...
  }, []);

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
            style={[styles.input, { color: themedTextColor }]}
            placeholder={t("expenseNamePlaceholder")}
            placeholderTextColor={useThemeColor({}, "placeholder")}
            value={title}
            onChangeText={setTitle}
          />

          {/* Move split mode section up, reduce margin */}
          <View style={{ marginTop: 8 }}>
            <ParticipantSection 
              selectedFriends={friends.filter((f) => 
                participantIds.map(id => id.trim()).includes(f.uid.trim())
              )} 
              participantIds={participantIds}
              onToggle={toggleParticipant}
              onAddPress={() => setShowAddPeople(true)}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">{t("step2Title")}</ThemedText>
            <TextInput
              style={[styles.input, { color: themedTextColor }]}
              keyboardType="numeric"
              placeholder={t("amountPlaceholder")}
              placeholderTextColor={useThemeColor({}, "placeholder")}
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
              style={[styles.input, { height: 100, textAlignVertical: "top", color: themedTextColor }]}
              multiline
              placeholder={t("notesPlaceholder")}
              placeholderTextColor={useThemeColor({}, "placeholder")}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
          
          <View style={{ marginTop: 20 }}>
            <ThemedText type="subtitle">4 · {t("attachments")}</ThemedText>
            
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
                attachmentImage ? { padding: 0 } : null
              ]}
            >
              {attachmentImage ? (
                <Image source={{ uri: attachmentImage }} style={styles.previewImage} />
              ) : (
                /* FIX 3: 彻底删掉 pointerEvents: 'none'，让它变回正常的 View */
                <View style={{ alignItems: 'center' }}> 
                  <Ionicons name="cloud-upload-outline" size={28} color={useThemeColor({}, "placeholder")}/>
                  <ThemedText style={{ color: useThemeColor({}, "placeholder"), marginTop: 4 }}>{t("attachments")}</ThemedText>
                </View>
              )}
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
          <PrimaryButton label={uploading ? t("uploading") || "Uploading..." : t("addExpense")}
            onPress={async () => {
              if (uploading) return;
              setUploading(true);
              let attachmentUrl = "";
              if (attachmentImage) {
                try {
                  attachmentUrl = await uploadImageAndGetUrl(attachmentImage, auth.currentUser?.uid || "anonymous");
                } catch (e) {
                  alert("Attachment upload failed");
                  setUploading(false);
                  return;
                }
              }
              // 保存账单到 Firestore（示例，需根据实际表结构调整）
              try {
                await addDoc(collection(db, "expenses"), {
                  groupId,
                  title,
                  totalAmount,
                  notes,
                  currency: selectedCurrency.code,
                  participantIds,
                  createdBy: auth.currentUser?.uid,
                  createdAt: Date.now(),
                  attachmentUrl: attachmentUrl || null,
                });
                setUploading(false);
                alert(t("addSuccess") || "Expense added!");
                // 可选：重置表单/关闭弹窗
                setTitle("");
                setTotalAmount("");
                setNotes("");
                setAttachmentImage(null);
                // router.back();
              } catch (e) {
                setUploading(false);
                alert(t("addFailed") || "Failed to add expense");
              }
            }}
            disabled={uploading}
          />
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
                  <ThemedText style={{ color: useThemeColor({}, "placeholder") }}>{t("noFriends") || "You don't have any friends"}</ThemedText>
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

          {/* Move split mode section up, reduce margin */}
          <View style={{ marginTop: 8 }}>
            <ParticipantSection 
              selectedFriends={friends.filter((f) => 
                participantIds.map(id => id.trim()).includes(f.uid.trim())
              )} 
              participantIds={participantIds}
              onToggle={toggleParticipant}
              onAddPress={() => setShowAddPeople(true)}
            />
          </View>

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