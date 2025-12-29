// app/auth/_layout.tsx
import { AppProviders } from "@/services/Providers";
import { Slot } from "expo-router";

export default function AuthLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
