// app/friends/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

// 1. 引入唯一的真理数据源
import friendsDataRaw from '../../assets/data/friends.json';
const friendsData = friendsDataRaw as any[];

export default function FriendsScreen() {
  return (
    <AppScreen>
      <AppTopBar title="Messages" showBack />
      <FlatList
        data={friendsData}
        keyExtractor={(item) => item.uid} // 使用 JSON 里的唯一 uid
        renderItem={({ item }) => (
          // 2. 跳转路径改为 JSON 里的 username
          <Pressable onPress={() => router.push(`/friends/${item.username}`)}>
            <ThemedView style={styles.row}>
              {/* 3. 使用 JSON 里的真实头像链接 */}
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
              
              <View style={styles.info}>
                <ThemedText type="defaultSemiBold">{item.displayName}</ThemedText>
                <ThemedText style={styles.usernameText}>@{item.username}</ThemedText>
              </View>
            </ThemedView>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.listContainer}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  usernameText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sep: { 
    height: 1, 
    backgroundColor: '#f3f4f6',
    marginLeft: 56, // 让分割线对齐文字而不是头像
  },
});