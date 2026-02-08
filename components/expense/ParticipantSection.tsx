// components/expense/ParticipantSection.tsx
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface ParticipantSectionProps {
  selectedFriends: any[];        
  participantIds: string[];      
  onToggle: (id: string) => void;  
  onAddPress: () => void;          
}

export function ParticipantSection({ selectedFriends, participantIds, onToggle, onAddPress }: ParticipantSectionProps) {
  // 1. 强力清洗 ID 列表，确保判定准确
  const cleanParticipantIds = participantIds.map(id => (id || "").trim());

  return (
    <View style={styles.section}>
      {/* <ThemedText type="subtitle">2 · Participants</ThemedText> */}
      
      <View style={styles.tileGrid}>
        {/* 渲染已选中的用户瓦片 */}
        {selectedFriends.map((friend) => {
          const cleanFriendUid = (friend.uid || "").trim();
          const isSelected = cleanParticipantIds.includes(cleanFriendUid);

          return (
            <Pressable 
              key={cleanFriendUid} 
              onPress={() => onToggle(cleanFriendUid)}
              style={[styles.tile, isSelected && styles.selectedTile]} 
            >
              <View style={[styles.avatar, isSelected && styles.selectedAvatar]}>
                <ThemedText style={[{ fontWeight: 'bold' }, isSelected && { color: '#fff' }]}>
                  {(friend.displayName || "U").charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={styles.tileText} numberOfLines={1}>
                {friend.displayName.length > 8 
                    ? `${friend.displayName.substring(0, 8)}...` 
                    : friend.displayName}
              </ThemedText>
              
              {isSelected && (
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={14} color="#2563eb" />
                </View>
              )}
            </Pressable>
          );
        })}

        {/* 2. 添加按钮：结构上绝对独立，样式上绝对对齐 */}
        <Pressable style={styles.addTile} onPress={onAddPress}>
          <View style={styles.addAvatar}>
            <Ionicons name="add" size={24} color="#6b7280" />
          </View>
          <ThemedText style={styles.addText}>Add</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 20, width: '100%' },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 6, // 缩小间距，确保不换行
    marginTop: 10,
  },
  // 找到 styles.tile 并替换
  // 
  tile: {
    flexDirection: 'row',    // 核心：头像和文字并排
    alignItems: 'center',
    paddingHorizontal: 10,   // 左右留出呼吸感
    paddingVertical: 6,      // 缩减高度
    borderRadius: 20,        // 变成圆润胶囊
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    backgroundColor: '#fff',
    marginRight: 4,          // 胶囊间的间距
  },
  selectedTile: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  selectedAvatar: { backgroundColor: '#2563eb' },
  tileText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  badge: { position: 'absolute', top: 4, right: 4 },
  
  // 添加按钮样式：必须与 tile 严格一致
  addTile: {
    flexDirection: 'row', // 也要变横向
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,    // 也要变胶囊
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
  },
  addAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  addText: { fontSize: 11, color: '#6b7280', fontWeight: 'bold', lineHeight: 20 },
});