// import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
// import { Stack } from "expo-router";
// import React, { useEffect } from "react";

// import { applyLocale } from "@/core/i18n";
// import { SettingsProvider, useSettings } from "@/core/settings/SettingsContext";

// function Inner() {
//   const { resolvedTheme, language } = useSettings();

//   // language 变就更新；不强依赖 hydrated，避免首屏闪烁
//   useEffect(() => {
//     applyLocale(language);
//   }, [language]);

//   return (
//     <ThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
//       <Stack screenOptions={{ headerShown: false }} />
//     </ThemeProvider>
//   );
// }

// export default function RootLayout() {
//   return (
//     <SettingsProvider>
//       <Inner />
//     </SettingsProvider>
//   );
// }

import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

import { applyLocale } from "@/core/i18n";
import { SettingsProvider, useSettings } from "@/core/settings/SettingsContext";
// 必须导入这个
import { AppProviders } from "@/services/Providers";

// 防止启动屏幕自动隐藏
SplashScreen.preventAutoHideAsync();

function Inner() {
  const { resolvedTheme, language } = useSettings();

  useEffect(() => {
    applyLocale(language);
  }, [language]);

  return (
    <ThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* 必须在这里包裹，让 Stack 里的所有页面都能共享 Context */}
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // 加载像素风字体
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <Inner />
    </SettingsProvider>
  );
}