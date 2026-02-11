// services/exchangeRateApi.ts
/**
 * ExchangeRate API Service
 * Handles real-time currency conversion using exchangerate-api.com
 * 
 * Free tier: 1,500 requests/month
 * API Key: Get one at https://www.exchangerate-api.com
 */

// const API_KEY = "ff56cbcf13d370b5a4222c2f"; // Replace with your actual API key
const API_KEY = "987fdf9c5b47a8a94c687be5"; // 备用测试密钥，注意监控调用次数
const BASE_URL = "https://v6.exchangerate-api.com/v6";

// 1. 在 API_KEY 下方新增缓存配置
const rateCache: Record<string, { rate: number; timestamp: number }> = {};
let apiCallCount = 0;
const CACHE_EXPIRY = 3600000; // 1小时缓存

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR" | "AUD" | "CAD";

interface ExchangeRateResponse {
  result: "success" | "error";
  base_code: string;
  target_code?: string;
  conversion_rate?: number;
  // rates?: Record<string, number>;
  conversion_result?: number;
  conversion_rates?: Record<string, number>;
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

    // return data.rates || null;
    return data.conversion_rates || null;
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
// export async function convertCurrency(
//   amount: number,
//   fromCurrency: Currency,
//   toCurrency: Currency
// ): Promise<ConversionResult | null> {
//   try {
//     // If same currency, return as-is
//     if (fromCurrency === toCurrency) {
//       return {
//         success: true,
//         fromCurrency,
//         toCurrency,
//         amount,
//         convertedAmount: amount,
//         rate: 1,
//         timestamp: Date.now(),
//       };
//     }

//     const response = await fetch(
//       `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`
//     );
//     const data: ExchangeRateResponse = await response.json();

//     if (data.result === "error") {
//       console.error("Exchange rate conversion error:", data.error_type);
//       return null;
//     }

//     return {
//       success: true,
//       fromCurrency,
//       toCurrency,
//       amount,
//       convertedAmount: amount * (data.conversion_rate || 1),
//       rate: data.conversion_rate || 1,
//       timestamp: Date.now(),
//     };
//   } catch (error) {
//     console.error("Failed to convert currency:", error);
//     return null;
//   }
// }

// 在 convertCurrency 函数内进行如下修改：
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<ConversionResult | null> {
  const cacheKey = `${fromCurrency}_${toCurrency}`;
  const now = Date.now();

  try {
    // 1. 效果：最优先判断。同币种换算，不计数，不走缓存，不发请求。
    if (fromCurrency === toCurrency) {
      return { success: true, fromCurrency, toCurrency, amount, convertedAmount: amount, rate: 1, timestamp: now };
    }

    // 2. 效果：缓存检查。如果命中且未过期，直接返回，不计数，不发请求。
    if (rateCache[cacheKey] && (now - rateCache[cacheKey].timestamp < CACHE_EXPIRY)) {
      const cachedRate = rateCache[cacheKey].rate;
      return {
        success: true,
        fromCurrency, toCurrency, amount,
        convertedAmount: amount * cachedRate,
        rate: cachedRate,
        timestamp: rateCache[cacheKey].timestamp,
      };
    }

    // 3. 效果：只有上述都没命中，才真正开始消耗 API 额度
    apiCallCount++;
    if (apiCallCount % 100 === 0) {
      console.warn(`[API Monitor] 注意：已发起第 ${apiCallCount} 次网络 API 请求！`);
    }

    const response = await fetch(`${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`);
    
    if (!response.ok) {
      return { success: false, fromCurrency, toCurrency, amount, convertedAmount: amount, rate: 1, timestamp: now };
    }

    const data: ExchangeRateResponse = await response.json();

    if (data.result === "error") {
      return { success: false, fromCurrency, toCurrency, amount, convertedAmount: amount, rate: 1, timestamp: now };
    }

    const rate = data.conversion_rate || 1;
    // 4. 写入缓存，供下次使用
    rateCache[cacheKey] = { rate, timestamp: now };

    return {
      success: true,
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount: data.conversion_result || (amount * rate),
      rate,
      timestamp: now,
    };
  } catch (error) {
    console.error("Conversion failed, using fallback:", error);
    return { success: false, fromCurrency, toCurrency, amount, convertedAmount: amount, rate: 1, timestamp: now };
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
