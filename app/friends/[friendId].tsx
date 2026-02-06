// app/friends/[friendId].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

// 1. 引入你建立的真理源头文件
import friendsDataRaw from '../../assets/data/friends.json';
const friendsData = friendsDataRaw as any[];

type Msg = { id: string; from: 'me' | 'other'; text: string };

export default function FriendChatScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  // 2. 动态查找好友信息，彻底废弃 DEMO_NAMES
  const currentFriend = useMemo(() => {
    return friendsData.find((f: any) => f.username === friendId) || friendsData[0];
  }, [friendId]);

  const [messages, setMessages] = useState<Msg[]>([
    { 
      id: '1', 
      from: 'other', 
      text: `Hi, I'm ${currentFriend.displayName}. Remember to add the bill?` 
    },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'me', text }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <AppScreen>
        {/* 3. TopBar 现在显示的是 JSON 里的真实姓名 */}
        <AppTopBar title={currentFriend.displayName} showBack />

        <ThemedView style={{ flex: 1 }}>
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.msgRow,
                  item.from === 'me' ? styles.msgRowMe : styles.msgRowOther,
                ]}
              >
                {/* 4. 如果是对方发的消息，显示 JSON 里的头像 */}
                {item.from === 'other' && (
                  <Image source={{ uri: currentFriend.avatar }} style={styles.miniAvatar} />
                )}
                
                <View
                  style={[
                    styles.bubble,
                    item.from === 'me' ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  <ThemedText style={item.from === 'me' ? styles.textMe : {}}>
                    {item.text}
                  </ThemedText>
                </View>
              </View>
            )}
          />
        </ThemedView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable onPress={send} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#2563eb" />
          </Pressable>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMe: { backgroundColor: '#2563eb' },
  bubbleOther: { backgroundColor: '#f3f4f6' },
  textMe: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});