// app/friends/[friendId].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

const DEMO_NAMES: Record<string, string> = {
  bob: 'Bob',
  alice: 'Alice',
  tom: 'Tom',
};

type Msg = { id: string; from: 'me' | 'other'; text: string };

export default function FriendChatScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const id = friendId ?? 'bob';
  const friendName = DEMO_NAMES[id] ?? 'Friend';

  const [messages, setMessages] = useState<Msg[]>([
    { id: '1', from: 'other', text: 'Hi, remember to add the bill?' },
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
        <AppTopBar title={friendName} showBack />

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
                <View
                  style={[
                    styles.bubble,
                    item.from === 'me' ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  <ThemedText>{item.text}</ThemedText>
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
            <Ionicons name="send-outline" size={20} />
          </Pressable>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 8, gap: 6 },
  msgRow: { flexDirection: 'row', marginVertical: 2, paddingHorizontal: 4 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bubbleMe: { backgroundColor: '#2563eb' },
  bubbleOther: { backgroundColor: '#e5e7eb' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
