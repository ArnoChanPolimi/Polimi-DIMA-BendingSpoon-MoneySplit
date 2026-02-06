import { Colors } from "@/constants/theme"; // 或 "@/constants/Colors"（按你项目实际）
import { useSettings } from "@/core/settings/SettingsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // ✅ 1) 优先使用你在 Settings 里选的 theme
  // ✅ 2) 如果 SettingsProvider 还没包住（开发时防崩），fallback 到系统
  let theme: "light" | "dark" = (useColorScheme() ?? "light") as "light" | "dark";

  try {
    const { resolvedTheme } = useSettings();
    theme = resolvedTheme;
  } catch {
    // ignore: Provider not mounted
  }

  const colorFromProps = props[theme];
  return colorFromProps ?? Colors[theme][colorName];
}