// app/(tabs)/quick-add.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function QuickAddScreen() {
  const [groupName, setGroupName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // 这里先用假数据，后面可以用真正的好友列表
  const demoFriends = ['Bob', 'Alice', 'Tom', 'Carol'];
  const [selected, setSelected] = useState<string[]>(['You']);

  const toggleFriend = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    );
  };

  return (
    <AppScreen>
      <AppTopBar title="New expense" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: 这次账单叫什么 */}
        <ThemedText type="subtitle">1 · Give this expense a name</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dinner at Milano"
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Step 2: 谁参加了（好友选择） */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          2 · Who is involved?
        </ThemedText>
        <ThemedText style={styles.hint}>
          Later, this will come from your friends list / contacts. For now it is demo data.
        </ThemedText>

        <View style={styles.chipRow}>
          <Chip
            label="You"
            selected={selected.includes('You')}
            onPress={() => toggleFriend('You')}
          />
          {demoFriends.map((name) => (
            <Chip
              key={name}
              label={name}
              selected={selected.includes(name)}
              onPress={() => toggleFriend(name)}
            />
          ))}
        </View>

        {/* Step 3: 金额 */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          3 · Total amount
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g. 120"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* 可选备注 */}
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
          Optional · Notes
        </ThemedText>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Anything you want to remember about this expense"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={{ height: 24 }} />

        <PrimaryButton
          title="Save (demo)"
          onPress={() => {
            // 现在先不连数据库，弹个提示就行
            alert(
              `Demo:\nName: ${groupName}\nAmount: ${amount}\nPeople: ${selected.join(
                ', ',
              )}`,
            );
          }}
        />
      </ScrollView>
    </AppScreen>
  );
}

// 小组件：好友选择 chip
type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <ThemedView
      as={View}
      style={[
        styles.chip,
        selected && styles.chipSelected,
      ]}
    >
      <ThemedText
        onPress={onPress}
        style={selected ? styles.chipTextSelected : undefined}
      >
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipTextSelected: {
    color: 'white',
  },
});
