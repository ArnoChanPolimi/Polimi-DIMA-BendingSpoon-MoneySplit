// app/friends/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

const DEMO_FRIENDS = [
  { id: 'bob', name: 'Bob' },
  { id: 'alice', name: 'Alice' },
  { id: 'tom', name: 'Tom' },
];

export default function FriendsScreen() {
  return (
    <AppScreen>
      <AppTopBar title="Messages" showBack />
      <FlatList
        data={DEMO_FRIENDS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/friends/${item.id}`)}>
            <ThemedView style={styles.row}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            </ThemedView>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
  avatarText: { fontSize: 14 },
  sep: { height: 1, backgroundColor: '#eee' },
});
