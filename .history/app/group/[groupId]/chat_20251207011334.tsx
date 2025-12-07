// app/group/[groupId]/chat.tsx
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
  groupId: string;
  senderId: 'me' | 'other' | 'system';
  senderName: string;
  text: string;
  createdAt: string;
};

const DEMO_GROUP_TITLES: Record<string, string> = {
  '1': 'Paris Trip 2022',
  '2': 'Roommates Bills 2023',
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    groupId: '1',
    senderId: 'system',
    senderName: 'System',
    text: 'You created this group.',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'm2',
    groupId: '1',
    senderId: 'other',
    senderName: 'Bob',
    text: 'Hey, remember to add yesterday’s dinner 🙂',
    createdAt: '2025-01-10T10:02:00Z',
  },
  {
    id: 'm3',
    groupId: '1',
    senderId: 'me',
    senderName: 'You',
    text: 'Sure, I will add it tonight.',
    createdAt: '2025-01-10T10:03:00Z',
  },
];

export default function GroupChatScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const id = groupId ?? '1';

  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_MESSAGES.filter((m) => m.groupId === id),
  );
  const [input, setInput] = useState('');

  const groupTitle = DEMO_GROUP_TITLES[id] ?? 'Group chat';

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toISOString();

    const newMsg: ChatMessage = {
      id: `m-${now}`,
      groupId: id,
      senderId: 'me',
      senderName: 'You',
      text: input.trim(),
      createdAt: now,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <AppScreen>
        <AppTopBar
          title={`${groupTitle} · Chat`}
          showBack
          rightIconName="close-outline"
          onRightIconPress={() => {
            // showBack 已经会 router.back()，右上角 close 可以什么都不做，或者再 router.back()
          }}
        />

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
  const isMe = message.senderId === 'me';
  const isSystem = message.senderId === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemRow}>
        <ThemedText style={styles.systemText}>{message.text}</ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.msgRow,
        isMe ? styles.msgRowMe : styles.msgRowOther,
      ]}
    >
      {!isMe && (
        <View style={styles.avatarSmall}>
          <ThemedText style={styles.avatarSmallText}>
            {message.senderName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        {!isMe && (
          <ThemedText style={styles.senderName}>
            {message.senderName}
          </ThemedText>
        )}
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
  systemRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  systemText: {
    fontSize: 11,
    opacity: 0.6,
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
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarSmallText: {
    fontSize: 11,
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
  senderName: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
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
