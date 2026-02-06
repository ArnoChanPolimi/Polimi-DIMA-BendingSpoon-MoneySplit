import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

import { applyLocale } from "@/core/i18n";
import { SettingsProvider, useSettings } from "@/core/settings/SettingsContext";

function Inner() {
  const { resolvedTheme, language } = useSettings();

  // ✅ language 变就更新；不强依赖 hydrated，避免首屏闪烁
  useEffect(() => {
    applyLocale(language);
  }, [language]);

  return (
    <ThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Inner />
    </SettingsProvider>
  );
}