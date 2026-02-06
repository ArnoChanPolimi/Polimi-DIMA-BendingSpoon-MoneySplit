// components\ui\PrimaryButton.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  processStep?: string; 
}

export default function PrimaryButton({ 
  label, 
  onPress, 
  variant = 'primary', 
  style,
  disabled = false,
  loading = false,       
  processStep = ''        
}: PrimaryButtonProps) {
  
  const isSecondary = variant === 'secondary';
  const isError = processStep.toLowerCase().includes('duplicate') || processStep.toLowerCase().includes('error');

  // 1. 按钮背景色逻辑
  const buttonVariantStyle = (disabled || loading)
    ? styles.disabledButton 
    : (isSecondary ? styles.secondaryButton : styles.primaryButton);

  // 2. 动脑子改动：文字颜色逻辑
  // 如果是 loading 或 disabled，文字颜色应该统一变淡，而不是死磕 white
  const labelVariantStyle = (disabled || loading)
    ? styles.disabledLabel
    : (isSecondary ? styles.secondaryLabel : styles.primaryLabel);

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Pressable 
        onPress={onPress} 
        disabled={disabled || loading} 
        style={({ pressed }) => [
          { width: '100%' },
          { opacity: (pressed && !disabled && !loading) ? 0.7 : 1.0 }
        ]}
      >
        <ThemedView style={[styles.button, buttonVariantStyle, style]}>
          <ThemedText type="defaultSemiBold" style={labelVariantStyle}>
            {loading ? "Processing..." : label}
          </ThemedText>
        </ThemedView>
      </Pressable>

      {(loading || processStep !== '') && (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          {loading && !isError && <ActivityIndicator color="#3b82f6" />}
          <ThemedText style={[
            styles.stepText, 
            isError && styles.errorText
          ]}>
            {processStep}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { backgroundColor: '#3b82f6' },
  secondaryButton: { backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#d1d5db' },
  disabledButton: { backgroundColor: '#9ca3af' }, // 按钮变灰
  primaryLabel: { color: 'white' },
  secondaryLabel: { color: '#374151' },
  disabledLabel: { color: '#f3f4f6' }, // 补齐：按钮变灰时文字也变淡，增加对比度
  stepText: { marginTop: 8, color: '#666', fontSize: 14 },
  errorText: { color: '#ef4444', fontWeight: 'bold' }
});