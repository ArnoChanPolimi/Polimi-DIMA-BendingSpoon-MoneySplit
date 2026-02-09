// services/exchangeRateApi.ts
/**
 * ExchangeRate API Service
 * Handles real-time currency conversion using exchangerate-api.com
 * 
 * Free tier: 1,500 requests/month
 * API Key: Get one at https://www.exchangerate-api.com
 */

const API_KEY = "ff56cbcf13d370b5a4222c2f"; // Replace with your actual API key
const BASE_URL = "https://v6.exchangerate-api.com/v6";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR" | "AUD" | "CAD";

interface ExchangeRateResponse {
  result: "success" | "error";
  base_code: string;
  target_code?: string;
  conversion_rate?: number;
  rates?: Record<string, number>;
  error_type?: string;
}

interface ConversionResult {
  success: boolean;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: number;
}

/**
 * Get latest exchange rates for a base currency
 * @param baseCurrency - Base currency code (e.g., "USD", "EUR")
 * @returns Object with exchange rates
 */
export async function getLatestRates(baseCurrency: Currency): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${baseCurrency}`);
    const data: ExchangeRateResponse = await response.json();

    if (data.result === "error") {
      console.error("Exchange rate API error:", data.error_type);
      return null;
    }

    return data.rates || null;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return null;
  }
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Conversion result with converted amount and rate
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<ConversionResult | null> {
  try {
    // If same currency, return as-is
    if (fromCurrency === toCurrency) {
      return {
        success: true,
        fromCurrency,
        toCurrency,
        amount,
        convertedAmount: amount,
        rate: 1,
        timestamp: Date.now(),
      };
    }

    const response = await fetch(
      `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`
    );
    const data: ExchangeRateResponse = await response.json();

    if (data.result === "error") {
      console.error("Exchange rate conversion error:", data.error_type);
      return null;
    }

    return {
      success: true,
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount: amount * (data.conversion_rate || 1),
      rate: data.conversion_rate || 1,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Failed to convert currency:", error);
    return null;
  }
}

/**
 * Get exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate as a number
 */
export async function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number | null> {
  try {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const response = await fetch(
      `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
    );
    const data: ExchangeRateResponse = await response.json();

    if (data.result === "error") {
      console.error("Exchange rate API error:", data.error_type);
      return null;
    }

    return data.conversion_rate || null;
  } catch (error) {
    console.error("Failed to get exchange rate:", error);
    return null;
  }
}

/**
 * List all supported currencies
 * Note: This is a static list. For a complete list, see:
 * https://www.exchangerate-api.com/docs/supported-currencies
 */
export const SUPPORTED_CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "INR",
  "AUD",
  "CAD",
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  AUD: "$",
  CAD: "$",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
};
