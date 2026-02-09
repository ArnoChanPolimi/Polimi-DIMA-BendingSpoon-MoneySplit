// core/currency/CurrencyContext.tsx
import {
    CURRENCY_NAMES,
    CURRENCY_SYMBOLS,
    Currency,
    SUPPORTED_CURRENCIES,
    convertCurrency,
    getExchangeRate,
} from "@/services/exchangeRateApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type CurrencyCtx = {
  defaultCurrency: Currency;
  setDefaultCurrency: (c: Currency) => Promise<void>;
  convertAmount: (amount: number, from: Currency, to: Currency) => Promise<number | null>;
  getRate: (from: Currency, to: Currency) => Promise<number | null>;
  formatAmount: (amount: number, currency: Currency) => string;
  supportedCurrencies: Currency[];
  currencySymbols: Record<Currency, string>;
  currencyNames: Record<Currency, string>;
  hydrated: boolean;
};

const Ctx = createContext<CurrencyCtx | null>(null);
const KEY_DEFAULT_CURRENCY = "app.currency.default";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [defaultCurrency, setDefaultCurrencyState] = useState<Currency>("EUR");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY_DEFAULT_CURRENCY);
        if (saved && SUPPORTED_CURRENCIES.includes(saved as Currency)) {
          setDefaultCurrencyState(saved as Currency);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setDefaultCurrency = async (c: Currency) => {
    setDefaultCurrencyState(c);
    await AsyncStorage.setItem(KEY_DEFAULT_CURRENCY, c);
  };

  const convertAmount = async (
    amount: number,
    from: Currency,
    to: Currency
  ): Promise<number | null> => {
    if (from === to) return amount;
    const result = await convertCurrency(amount, from, to);
    return result?.convertedAmount ?? null;
  };

  const getRate = async (from: Currency, to: Currency): Promise<number | null> => {
    return await getExchangeRate(from, to);
  };

  const formatAmount = (amount: number, currency: Currency): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = amount.toFixed(2);
    return `${symbol}${formatted}`;
  };

  const value = useMemo(
    () => ({
      defaultCurrency,
      setDefaultCurrency,
      convertAmount,
      getRate,
      formatAmount,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      currencySymbols: CURRENCY_SYMBOLS,
      currencyNames: CURRENCY_NAMES,
      hydrated,
    }),
    [defaultCurrency, hydrated]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCurrency must be used within CurrencyProvider");
  return v;
}
