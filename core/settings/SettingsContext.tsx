import { applyLocale } from "@/core/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type Language = "en" | "it";

type SettingsCtx = {
  theme: ThemeMode;
  language: Language;
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeMode) => Promise<void>;
  setLanguage: (l: Language) => Promise<void>;
  hydrated: boolean;
};

const Ctx = createContext<SettingsCtx | null>(null);

const KEY_THEME = "app.settings.theme";
const KEY_LANG = "app.settings.language";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const system = useRNColorScheme(); // 'light' | 'dark' | null
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [language, setLanguageState] = useState<Language>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [t, l] = await Promise.all([
          AsyncStorage.getItem(KEY_THEME),
          AsyncStorage.getItem(KEY_LANG),
        ]);
        if (t === "system" || t === "light" || t === "dark") setThemeState(t);
        const lang = (l === "en" || l === "it") ? l : "en";
        if (l === "en" || l === "it") setLanguageState(lang);
        applyLocale(lang); // 初始化时应用语言到 i18n
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (theme === "light") return "light";
    if (theme === "dark") return "dark";
    return system === "dark" ? "dark" : "light";
  }, [theme, system]);

  const setTheme = async (t: ThemeMode) => {
    setThemeState(t);
    await AsyncStorage.setItem(KEY_THEME, t);
  };

  const setLanguage = async (l: Language) => {
    setLanguageState(l);
    await AsyncStorage.setItem(KEY_LANG, l);
    applyLocale(l); // 立即应用语言到 i18n
  };

  const value = useMemo(
    () => ({ theme, language, resolvedTheme, setTheme, setLanguage, hydrated }),
    [theme, language, resolvedTheme, hydrated]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}