// app/group/new.tsx
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

export default function NewGroupScreen() {
  const [name, setName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    // TODO: 将来这里调用后端保存 group + members
    console.log('Create group (demo):', {
      name,
      members: [member1, member2].filter(Boolean),
    });

    router.back();
  };

  return (
    <AppScreen>
      <AppTopBar title="New group" showBack />

      <View style={styles.field}>
        <ThemedText>Group name</ThemedText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Paris Trip, Roommates..."
        />
      </View>

      <ThemedText type="subtitle">Members (demo)</ThemedText>

      <View style={styles.field}>
        <ThemedText>Member 1</ThemedText>
        <TextInput
          style={styles.input}
          value={member1}
          onChangeText={setMember1}
          placeholder="Alice"
        />
      </View>

      <View style={styles.field}>
        <ThemedText>Member 2</ThemedText>
        <TextInput
          style={styles.input}
          value={member2}
          onChangeText={setMember2}
          placeholder="Bob"
        />
      </View>

      <PrimaryButton label="Save (demo)" onPress={handleSave} />
      <ThemedText>
        TODO: later we support adding many members dynamically.
      </ThemedText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
