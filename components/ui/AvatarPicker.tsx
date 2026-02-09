// components/ui/AvatarPicker.tsx
// 头像选择器组件 - 支持默认头像库和自定义上传
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { t } from "@/core/i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Image,
    ImageSourcePropType,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

// 默认头像库类型
interface DefaultAvatar {
  id: string;
  source: ImageSourcePropType;
}

// 默认头像库 - 把图片放到 assets/images/avatars/ 目录下
// 命名为 avatar_1.png, avatar_2.png, ... avatar_8.png
const DEFAULT_AVATARS: DefaultAvatar[] = [
  { id: "avatar_1", source: require("@/assets/images/avatars/avatar_1.png") },
  { id: "avatar_2", source: require("@/assets/images/avatars/avatar_2.png") },
  { id: "avatar_3", source: require("@/assets/images/avatars/avatar_3.png") },
  { id: "avatar_4", source: require("@/assets/images/avatars/avatar_4.png") },
  { id: "avatar_5", source: require("@/assets/images/avatars/avatar_5.png") },
  { id: "avatar_6", source: require("@/assets/images/avatars/avatar_6.png") },
  { id: "avatar_7", source: require("@/assets/images/avatars/avatar_7.png") },
  { id: "avatar_8", source: require("@/assets/images/avatars/avatar_8.png") },
];

// 头像颜色选项（纯色头像背景）
const AVATAR_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

// 头像类型定义
interface UserAvatar {
  type: "default" | "color" | "custom";
  value: string;
}

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (avatar: UserAvatar) => void;
  currentAvatar?: UserAvatar | null;
  userName?: string;
}

export default function AvatarPicker({
  visible,
  onClose,
  onSelect,
  currentAvatar,
  userName = "U",
}: AvatarPickerProps) {
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const [selectedTab, setSelectedTab] = useState<"default" | "color" | "custom">("default");

  const avatarInitial = (userName || "U")[0].toUpperCase();

  // 从相册选择图片
  const pickCustomImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission denied!");
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        onSelect({ type: "custom", value: result.assets[0].uri });
        onClose();
      }
    } catch (err) {
      console.error("Image pick failed:", err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ThemedView style={[styles.container, { borderColor, backgroundColor: cardColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle">{t("selectAvatar")}</ThemedText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, selectedTab === "default" && styles.tabActive]}
              onPress={() => setSelectedTab("default")}
            >
              <ThemedText style={selectedTab === "default" ? styles.tabTextActive : undefined}>
                {t("defaultAvatars")}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === "color" && styles.tabActive]}
              onPress={() => setSelectedTab("color")}
            >
              <ThemedText style={selectedTab === "color" ? styles.tabTextActive : undefined}>
                {t("colorAvatars")}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === "custom" && styles.tabActive]}
              onPress={() => setSelectedTab("custom")}
            >
              <ThemedText style={selectedTab === "custom" ? styles.tabTextActive : undefined}>
                {t("customAvatar")}
              </ThemedText>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {selectedTab === "default" && (
              <View style={styles.grid}>
                {DEFAULT_AVATARS.map((avatar) => (
                  <Pressable
                    key={avatar.id}
                    style={[
                      styles.avatarItem,
                      currentAvatar?.type === "default" && currentAvatar.value === avatar.id && styles.avatarSelected,
                    ]}
                    onPress={() => {
                      onSelect({ type: "default", value: avatar.id });
                      onClose();
                    }}
                  >
                    <Image source={avatar.source} style={styles.avatarImage} />
                    {currentAvatar?.type === "default" && currentAvatar.value === avatar.id && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {selectedTab === "color" && (
              <View style={styles.grid}>
                {AVATAR_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.avatarItem,
                      currentAvatar?.type === "color" && currentAvatar.value === color && styles.avatarSelected,
                    ]}
                    onPress={() => {
                      onSelect({ type: "color", value: color });
                      onClose();
                    }}
                  >
                    <View style={[styles.colorAvatar, { backgroundColor: color }]}>
                      <ThemedText style={styles.colorAvatarText}>{avatarInitial}</ThemedText>
                    </View>
                    {currentAvatar?.type === "color" && currentAvatar.value === color && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {selectedTab === "custom" && (
              <View style={styles.customSection}>
                <Pressable style={styles.uploadButton} onPress={pickCustomImage}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#9ca3af" />
                  <ThemedText style={{ color: "#9ca3af", marginTop: 8 }}>
                    {t("uploadFromGallery")}
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  tabTextActive: {
    color: "#2563eb",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "flex-start",
  },
  avatarItem: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderColor: "#2563eb",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  colorAvatar: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  colorAvatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  checkBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  customSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  uploadButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
});

// 导出默认头像数据供其他组件使用
export { AVATAR_COLORS, DEFAULT_AVATARS };

