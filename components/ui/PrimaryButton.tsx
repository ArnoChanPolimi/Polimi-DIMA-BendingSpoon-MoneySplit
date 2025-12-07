// components/ui/PrimaryButton.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Pressable, StyleSheet } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
}

export default function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.button}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6', // 蓝色按钮
  },
  label: {
    color: 'white',
  },
});
