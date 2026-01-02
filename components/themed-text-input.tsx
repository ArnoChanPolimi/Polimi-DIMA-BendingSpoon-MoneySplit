import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

type Props = TextInputProps & {
  lightBackgroundColor?: string;
  darkBackgroundColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
};

export default function ThemedTextInput({
  style,
  lightBackgroundColor,
  darkBackgroundColor,
  lightBorderColor,
  darkBorderColor,
  placeholderTextColor,
  ...props
}: Props) {
  // 文字颜色跟随主题
  const textColor = useThemeColor({}, "text");

  // ✅ 默认用 card 作为输入框背景（更像“输入框/卡片”，而不是跟页面 background 一样）
  const backgroundColor = useThemeColor(
    { light: lightBackgroundColor, dark: darkBackgroundColor },
    "card"
  );

  // ✅ 默认用 border
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    "border"
  );

  // ✅ 默认 placeholder
  const defaultPlaceholder = useThemeColor({}, "placeholder");

  return (
    <TextInput
      {...props}
      style={[
        styles.base,
        { color: textColor, backgroundColor, borderColor },
        style,
      ]}
      placeholderTextColor={placeholderTextColor ?? defaultPlaceholder}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
});