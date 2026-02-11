// components/ui/AppTopBar.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

// 自定义刷新图标
const REFRESH_ICON = require("@/assets/images/refresh.png");

type AppTopBarProps = {
  title: string;
  showBack?: boolean;
  /** 返回按钮大小 */
  backSize?: number;
  /** 新增：可以自己决定返回去哪儿 */
  onBackPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  renderRight?: () => React.ReactNode;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 刷新按钮的点击回调 */
  onRefreshPress?: () => void;
  /** 是否正在刷新（用于显示加载动画） */
  isRefreshing?: boolean;
};

export default function AppTopBar({
  title,
  showBack = false,
  backSize = 25,
  onBackPress,
  rightLabel,
  onRightPress,
  rightIconName,
  onRightIconPress,
  renderRight,
  showRefresh = false,
  onRefreshPress,
  isRefreshing = false,
}: AppTopBarProps) {
  // 主题颜色：让 icon / 文本 / 边框都随主题变化
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  // 2. 获取原生的 navigation 对象
  const navigation = useNavigation();

  // 3. 封装智能返回逻辑
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    // 集中处理点：检查是否有堆栈可以回退
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // 如果无处可回（常见于从外部直接打开、Tab切换、或清理了Auth堆栈后）
      // 安全地重定向到 Tab 首页
      router.replace("/(tabs)"); 
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={handleBack} // 使用封装后的逻辑
            hitSlop={15}
          >
            <PixelIcon name="back" size={backSize} color={textColor} />
          </Pressable>
        ) : (
          /* 4. 这里的占位建议与右侧对齐或保持弹性，防止标题偏移 */
          <View style={{ width: backSize }} />
        )}
      </View>

      {/* 标题：ThemedText 本身会跟主题，但这里明确一下颜色更稳 */}
      <ThemedText type="title" style={[styles.title, { color: textColor }]}>
        {title}
      </ThemedText>

      <View style={styles.right}>
        {renderRight && renderRight()}
        {rightLabel && (
          <Pressable
            onPress={onRightPress}
            style={[styles.rightLabelWrapper, { borderColor }]}
            hitSlop={10}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[styles.rightLabel, { color: textColor }]}
            >
              {rightLabel}
            </ThemedText>
          </Pressable>
        )}

        {showRefresh && (
          <Pressable
            onPress={onRefreshPress}
            style={styles.iconWrapper}
            hitSlop={10}
            disabled={isRefreshing}
          >
            <Image 
              source={REFRESH_ICON}
              style={[
                styles.refreshIcon,
                isRefreshing && { opacity: 0.5 }
              ]}
              resizeMode="contain"
            />
          </Pressable>
        )}

        {rightIconName && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.iconWrapper}
            hitSlop={10}
          >
            <Ionicons name={rightIconName} size={22} color={textColor} />
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  left: {
    width: 40,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  right: {
    width: 80,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  rightLabelWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    // borderColor 由主题注入
  },
  rightLabel: {
    fontSize: 14,
  },
  iconWrapper: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  refreshIcon: {
    width: 24,
    height: 24,
  },
});