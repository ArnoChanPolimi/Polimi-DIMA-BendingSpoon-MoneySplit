// components/ui/PrimaryButton.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
}

export default function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  // ✅ 使用语义化主按钮颜色（你已在 Colors 里加了 primary）
  const backgroundColor = useThemeColor({}, "primary");

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={[styles.button, { backgroundColor }]}>
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
    alignItems: "center",
    justifyContent: "center",
    // ❌ 不再写死 backgroundColor
  },
  label: {
    color: "white",
  },
});