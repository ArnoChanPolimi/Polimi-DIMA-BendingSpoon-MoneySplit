// app/group/[groupId]/add-expense.tsx
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

export default function AddExpenseScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [participants, setParticipants] = useState('Alice, Bob, Charlie');

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!title.trim() || isNaN(value)) {
      Alert.alert('Error', 'Please enter a title and valid amount.');
      return;
    }

    // TODO: 以后改成真正调用 core + services 保存到数据库
    console.log('Add expense (demo):', {
      groupId,
      title,
      amount: value,
      paidBy,
      participants,
    });

    router.back();
  };

  return (
    <AppScreen>
      <AppTopBar
        title="Add expense"
        showBack
      />

      <ThemedText>Group ID: {String(groupId ?? '')}</ThemedText>

      <View style={styles.field}>
        <ThemedText>Title</ThemedText>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Dinner, Taxi..."
        />
      </View>

      <View style={styles.field}>
        <ThemedText>Total amount (€)</ThemedText>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="45.00"
        />
      </View>

      <View style={styles.field}>
        <ThemedText>Paid by (demo)</ThemedText>
        <TextInput
          style={styles.input}
          value={paidBy}
          onChangeText={setPaidBy}
          placeholder="Alice"
        />
      </View>

      <View style={styles.field}>
        <ThemedText>Participants (demo)</ThemedText>
        <TextInput
          style={styles.input}
          value={participants}
          onChangeText={setParticipants}
          placeholder="Alice, Bob, Charlie"
        />
      </View>

      <ThemedText>
        Split type: for v1 we assume equal split among participants.
      </ThemedText>

      <PrimaryButton label="Save (demo)" onPress={handleSave} />
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
