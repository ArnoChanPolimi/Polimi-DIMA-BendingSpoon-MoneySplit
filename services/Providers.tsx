// // services\Providers.tsx
// import AuthProvider from "@/components/auth/AuthContext";

// export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   return <AuthProvider>{children}</AuthProvider>;
// };

// services/Providers.tsx
import AuthProvider from "@/components/auth/AuthContext";
import { CurrencyProvider } from "@/core/currency/CurrencyContext";
import React from "react";
import { View } from "react-native";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      <CurrencyProvider>
        <AuthProvider>{children}</AuthProvider>
      </CurrencyProvider>

      {/* 如果有全局 overlay / toast / modal 可以放这里 */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      >
        {/* toast / loading 等 */}
      </View>
    </View>
  );
};
