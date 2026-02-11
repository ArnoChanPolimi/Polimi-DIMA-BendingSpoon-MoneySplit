// app/(tabs)/quick-add.tsx
// 创建群组页面
import { ParticipantSection } from "@/components/expense/ParticipantSection";
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { t } from '@/core/i18n';
import { auth, db, uploadImageAndGetUrl } from '@/services/firebase';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

// 预设的封面颜色
const COVER_COLORS = [
  '#3b82f6', // 蓝色
  '#10b981', // 绿色
  '#f59e0b', // 黄色
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#06b6d4', // 青色
  '#f97316', // 橙色
];

// 封面类型
type CoverType = { type: 'none' } | { type: 'color'; value: string } | { type: 'image'; value: string };

export default function CreateGroupScreen() {
  const router = useRouter();
  
  // 群组基本信息
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [cover, setCover] = useState<CoverType>({ type: 'none' });
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  
  // 成员选择
  const [realFriends, setRealFriends] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showAddPeople, setShowAddPeople] = useState(false);
  
  // UI 状态
  const [loading, setLoading] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [nameError, setNameError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 从 Firebase 获取好友列表
  useEffect(() => {
    const loadRemoteFriends = async () => {
      const myUid = auth.currentUser?.uid;
      if (!myUid) return;

      const snap = await getDocs(collection(db, "users", myUid, "friends"));
      const list = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setRealFriends(list);
    };
    loadRemoteFriends();
  }, [showAddPeople]);

  // 生成群组ID
  const generateGroupId = () => {
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GRP-${datePart}-${randomPart}`;
  };

  // 从相册选择封面图片
  const pickCoverFromGallery = async () => {
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
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        setCover({ type: 'image', value: result.assets[0].uri });
        setShowCoverPicker(false);
      }
    } catch (err) {
      console.error("Image pick failed:", err);
    }
  };

  // --- 新增：拍照功能 ---
  const takePhotoWithCamera = async () => {
    if (Platform.OS !== 'web') {
      // 申请相机权限
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t("error"), "Sorry, we need camera permissions to make this work!");
        return;
      }
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // 允许裁剪
        aspect: [16, 9],     // 保持 16:9 比例
        quality: 0.7,        // 压缩质量
      });

      if (!result.canceled && result.assets) {
        setCover({ type: 'image', value: result.assets[0].uri });
        setShowCoverPicker(false);
      }
    } catch (err) {
      console.error("Camera launch failed:", err);
      Alert.alert(t("error"), "Failed to open camera");
    }
  };

  // 选择颜色作为封面
  const selectCoverColor = (color: string) => {
    setCover({ type: 'color', value: color });
    setShowCoverPicker(false);
  };

  // 清除封面
  const clearCover = () => {
    setCover({ type: 'none' });
    setShowCoverPicker(false);
  };

  // 创建群组
  const handleCreateGroup = async () => {
    setNameError(false);
    setProcessStep('');

    // 校验群组名称
    if (!groupName.trim()) {
      setNameError(true);
      Alert.alert(t("error"), t("enterGroupName"));
      return;
    }

    setLoading(true);
    setProcessStep('Connecting...');

    const myUid = auth.currentUser?.uid || "anon";
    const trimmedName = groupName.trim();

    try {
      const uniqueGroupId = generateGroupId();

      const now = new Date();
      const formattedStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // 处理封面
      let coverData: { type: string; value: string } | null = null;
      if (cover.type === 'image') {
        setProcessStep('Uploading cover...');
        const coverUrl = await uploadImageAndGetUrl(cover.value, uniqueGroupId);
        coverData = { type: 'image', value: coverUrl };
      } else if (cover.type === 'color') {
        coverData = { type: 'color', value: cover.value };
      }

      // 检查名称是否重复
      setProcessStep('Checking name...');
      const groupsRef = collection(db, "groups");
      // const nameQuery = query(groupsRef, where("name", "==", trimmedName));
      const nameQuery = query(
        groupsRef, 
        where("name", "==", trimmedName),
        where("ownerId", "==", myUid) 
      );
      const querySnapshot = await getDocs(nameQuery);

      if (!querySnapshot.empty) {
        setLoading(false);
        setNameError(true);
        setProcessStep('');
        Alert.alert(t("error"), t("alreadyExists"));
        return;
      }

      // 构建成员列表（包含自己）
      setProcessStep('Creating group...');
      const allMemberIds = Array.from(new Set([myUid, ...selectedMembers]));
      
      const membersData = realFriends
        .filter(f => allMemberIds.includes(f.uid))
        .map(f => ({
          uid: f.uid,
          displayName: f.displayName || f.email || "Unknown"
        }));

      const membersWithMe = [
        { uid: myUid, displayName: auth.currentUser?.displayName || "Me" },
        ...membersData.filter(m => m.uid !== myUid)
      ];

      // 保存群组
      const groupDocRef = doc(db, "groups", uniqueGroupId);
      await setDoc(groupDocRef, {
        id: uniqueGroupId,
        name: trimmedName,
        description: groupDescription.trim(),
        cover: coverData, // 新的 cover 格式: { type: 'image'|'color', value: string } 或 null
        ownerId: myUid,
        participantIds: allMemberIds,
        payerIds: [myUid],
        involvedFriends: membersWithMe,
        totalExpenses: 0,
        startDate: formattedStartDate,
        updatedAt: Date.now(),
        createdAt: Date.now(),
        status: 'ongoing',
      });

      // 通知成员
      setProcessStep('Notifying members...');
      const currentUserName = auth.currentUser?.displayName || "Someone";

      const notificationPromises = allMemberIds
        .filter((uid: string) => uid !== myUid)
        .map((friendUid: string) => {
          const notifRef = doc(collection(db, "notifications"));
          return setDoc(notifRef, {
            to: friendUid,
            fromId: myUid,
            fromName: currentUserName,
            type: "new_group",
            groupName: trimmedName,
            groupId: uniqueGroupId,
            status: "unread",
            createdAt: Date.now()
          });
        });

      await Promise.all(notificationPromises);

      setProcessStep('Success!');
      setTimeout(() => {
        // 清空状态
        setGroupName('');
        setGroupDescription('');
        setCover({ type: 'none' });
        setSelectedMembers([]);
        setLoading(false);
        setProcessStep('');

        // 跳转到新创建的群组
        router.push(`/group/${uniqueGroupId}`);
      }, 500);

    } catch (e: any) {
      setLoading(false);
      setProcessStep('');
      Alert.alert(t("error"), "Failed to create group. Please try again.");
      console.error("Create group failed:", e);
    }
  };

  // 刷新表单
  const handleRefresh = () => {
    setIsRefreshing(true);
    setGroupName('');
    setGroupDescription('');
    setCover({ type: 'none' });
    setSelectedMembers([]);
    setNameError(false);
    setProcessStep('');
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <AppScreen>
      <AppTopBar
        title={t("newExpenseGroup")}
        showRefresh={true}
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 封面选择 */}
        <ThemedText type="subtitle">{t("selectCover")}</ThemedText>
        <Pressable style={styles.coverContainer} onPress={() => setShowCoverPicker(true)}>
          {cover.type === 'image' ? (
            <Image source={{ uri: cover.value }} style={styles.coverImage} />
          ) : cover.type === 'color' ? (
            <View style={[styles.coverPlaceholder, { backgroundColor: cover.value }]}>
              <Ionicons name="color-palette" size={40} color="#fff" />
            </View>
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
              <ThemedText style={{ color: '#9ca3af', marginTop: 8 }}>
                {t("tapToSelectCover")}
              </ThemedText>
            </View>
          )}
          {cover.type !== 'none' && (
            <Pressable
              style={styles.coverEditBadge}
              onPress={() => setShowCoverPicker(true)}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
            </Pressable>
          )}
        </Pressable>

        {/* 群组名称 */}
        <ThemedText type="subtitle" style={[styles.sectionTitle, nameError && { color: '#ef4444' }]}>
          {t("groupNameTitle")} {nameError && `(${t("alreadyExists")})`}
        </ThemedText>
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          value={groupName}
          onChangeText={(text) => {
            setGroupName(text);
            if (nameError) setNameError(false);
          }}
          placeholder={t("groupNamePlaceholder")}
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />

        {/* 群组描述 */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t("groupDescription")}
        </ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={groupDescription}
          onChangeText={setGroupDescription}
          placeholder={t("groupDescriptionPlaceholder")}
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          editable={!loading}
        />

        {/* 选择成员 */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t("selectMembers")}
        </ThemedText>
        <View style={styles.membersContainer}>
          <ParticipantSection
            selectedFriends={realFriends.filter(f => selectedMembers.includes(f.uid))}
            participantIds={selectedMembers}
            onToggle={(uid) => setSelectedMembers(prev => prev.filter(id => id !== uid))}
            onAddPress={() => setShowAddPeople(true)}
          />
        </View>

        <View style={{ height: 32 }} />

        <PrimaryButton
          label={t("confirmGenerateBill")}
          onPress={handleCreateGroup}
          disabled={loading}
          loading={loading}
          processStep={processStep}
        />
      </ScrollView>

      {/* 选择成员弹窗 */}
      <Modal visible={showAddPeople} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{t("selectFriends")}</ThemedText>
              <Pressable onPress={() => setShowAddPeople(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {realFriends.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ThemedText style={{ color: '#94a3b8' }}>{t("loadingOrNoFriends")}</ThemedText>
                </View>
              ) : (
                realFriends.map(f => (
                  <Pressable
                    key={f.uid}
                    onPress={() => {
                      setSelectedMembers(prev =>
                        prev.includes(f.uid)
                          ? prev.filter(u => u !== f.uid)
                          : [...prev, f.uid]
                      );
                    }}
                    style={styles.modalRow}
                  >
                    <View style={styles.friendAvatar}>
                      <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                        {(f.displayName || 'U').charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText style={{ flex: 1 }}>{f.displayName || f.email}</ThemedText>
                    {selectedMembers.includes(f.uid) && (
                      <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
            <PrimaryButton label={t("done")} onPress={() => setShowAddPeople(false)} />
          </View>
        </View>
      </Modal>

      {/* Cover Picker Modal */}
      <Modal visible={showCoverPicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCoverPicker(false)}>
          <View style={styles.coverPickerCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{t("selectCover")}</ThemedText>
              <Pressable onPress={() => setShowCoverPicker(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>
            
            {/* 颜色选择 */}
            <ThemedText style={styles.coverPickerLabel}>Choose a color</ThemedText>
            <View style={styles.colorGrid}>
              {COVER_COLORS.map(color => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    cover.type === 'color' && cover.value === color && styles.colorOptionSelected
                  ]}
                  onPress={() => selectCoverColor(color)}
                >
                  {cover.type === 'color' && cover.value === color && (
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>

            {/* --- 新增：拍照按钮 --- */}
            <Pressable style={styles.coverPickerOption} onPress={takePhotoWithCamera}>
              <Ionicons name="camera-outline" size={24} color="#3b82f6" />
              <ThemedText style={{ marginLeft: 12, color: '#3b82f6' }}>Take a photo</ThemedText>
            </Pressable>

            {/* 从相册选择 */}
            <Pressable style={styles.coverPickerOption} onPress={pickCoverFromGallery}>
              <Ionicons name="images-outline" size={24} color="#3b82f6" />
              <ThemedText style={{ marginLeft: 12, color: '#3b82f6' }}>Choose from gallery</ThemedText>
            </Pressable>

            {/* 清除封面 */}
            {cover.type !== 'none' && (
              <Pressable style={styles.coverPickerOption} onPress={clearCover}>
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
                <ThemedText style={{ marginLeft: 12, color: '#ef4444' }}>Remove cover</ThemedText>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  coverContainer: {
    marginTop: 8,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersContainer: {
    marginTop: 8,
    minHeight: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Cover Picker 样式
  coverPickerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  coverPickerLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderColor: '#1f2937',
  },
  coverPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
});
