// components/settings/SettingRow.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from "@/hooks/use-theme-color"; // 确保图标颜色随主题变化
import { Ionicons } from "@expo/vector-icons"; // 导入图标库
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode; 
  icon?: keyof typeof Ionicons.glyphMap; // 新增：支持传入图标名
}

export default function SettingRow({ title, subtitle, onPress, right, icon }: Props) {
  const textColor = useThemeColor({}, "text");

  const content = (
    <ThemedView style={styles.row}>
      <View style={styles.left}>
        <View style={styles.titleContainer}>
          {/* 如果传了 icon，就渲染在文字左侧 */}
          {icon && (
            <Ionicons 
              name={icon} 
              size={18} 
              color={textColor} 
              style={styles.iconStyle} 
            />
          )}
          <ThemedText style={styles.pixelTitle}>{title}</ThemedText>
        </View>
        
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    marginRight: 10,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  right: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  pixelTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    lineHeight: 16,
  },
});