// app/friends/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

type Friend = {
  id: string;
  name: string;
  lastMessage: string;
};

const DEMO_FRIENDS: Friend[] = [
  { id: 'bob', name: 'Bob', lastMessage: 'Let’s settle the Paris trip 🍷' },
  { id: 'alice', name: 'Alice', lastMessage: 'I added yesterday’s dinner.' },
  { id: 'tom', name: 'Tom', lastMessage: 'Can you send me the receipt?' },
];

export default function FriendsScreen() {
  return (
    <AppScreen>
      <AppTopBar title="Messages" showBack />

      <FlatList
        data={DEMO_FRIENDS}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/friends/${item.id}`)}
          >
            <ThemedView style={styles.row}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">
                  {item.name}
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  style={{ fontSize: 12, opacity: 0.7 }}
                >
                  {item.lastMessage}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} />
            </ThemedView>
          </Pressable>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sep: {
    height: 1,
    backgroundColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
});
