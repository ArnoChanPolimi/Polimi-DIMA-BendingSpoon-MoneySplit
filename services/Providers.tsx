// services\Providers.tsx
import AuthProvider from "@/components/auth/AuthContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};