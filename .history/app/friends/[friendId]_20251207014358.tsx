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

type ChatMessage = {
  id: string;
  friendId: string;
  sender: 'me' | 'other';
  text: string;
};

const DEMO_NAMES: Record<string, string> = {
  bob: 'Bob',
  alice: 'Alice',
  tom: 'Tom',
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', friendId: 'bob', sender: 'other', text: 'Hi, did you add the hotel?' },
  { id: '2', friendId: 'bob', sender: 'me', text: 'Yes, it’s in the Paris trip group.' },
];

export default function FriendChatScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const id = friendId ?? 'bob';
  const friendName = DEMO_NAMES[id] ?? 'Friend';

  const [messages, setMessages] = useState(
    INITIAL_MESSAGES.filter((m) => m.friendId === id),
  );
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const now = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: now, friendId: id, sender: 'me', text: input.trim() },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <AppScreen>
        <AppTopBar title={friendName} showBack />

        <ThemedView style={styles.chatContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messagesContent}
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
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send-outline" size={20} />
          </Pressable>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.sender === 'me';
  return (
    <View
      style={[
        styles.msgRow,
        isMe ? styles.msgRowMe : styles.msgRowOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        <ThemedText>{message.text}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 8,
    gap: 6,
  },
  msgRow: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 4,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bubbleMe: {
    backgroundColor: '#2563eb',
  },
  bubbleOther: {
    backgroundColor: '#e5e7eb',
  },
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
