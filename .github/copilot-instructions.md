# AI Coding Agent Instructions – MoneySplit

## Project Overview

**MoneySplit** is an Expo-based React Native expense-sharing app (TypeScript). Built by a university team using Bending Spoons principles: clean separation of concerns, pure business logic, and Firebase for auth/data.

**Key Stack:**
- **Frontend:** Expo, React Native, React Router (file-based routing)
- **State:** React Context (Auth, Settings); Firebase Realtime (Firestore + Storage)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **i18n:** i18next + expo-localization (English, Chinese, Italian)
- **Styling:** React Native default + `constants/theme.ts` for theming

---

## Architecture & Core Patterns

### Layer 1: UI Pages (`app/`)
- **Responsibility:** Display screens, handle user gestures, navigate between pages
- **NOT responsible for:** Business logic, data calculation, database operations
- **Routing:** Expo Router file-based (e.g., `app/(tabs)/index.tsx` → `/` tab)
- **Key pattern:** Use `AppScreen` wrapper component for consistent SafeArea + ScrollView
- **Example:** `app/(tabs)/index.tsx` fetches groups via Firestore listener, renders `GroupCard` components

### Layer 2: Components (`components/`)
- **Themed UI Building Blocks:** `ThemedText`, `ThemedView`, `ThemedTextInput`
- **Organized by Feature:** `components/auth/`, `components/expense/`, `components/group/`, `components/ui/`
- **Key:** Use `useThemeColor()` hook to read theme values; components are **not responsible for fetching data**

### Layer 3: Business Logic (`core/`)
- **Pure TypeScript functions—no side effects, no React**
- **No network, storage, or React Native dependencies**
- **Modules:**
  - `core/i18n/` – Centralized i18n translations & locale setup (managed by SettingsContext)
  - `core/usecases/` – Domain-specific functions (e.g., `addExpense()`, `calculateBalances()`)
  - `core/aa/types.ts` – Core data models (User, Group, Expense, Balance) [currently empty; should define these]
  - `core/logging/` – Logger utility for debugging
  - `core/settings/SettingsContext.tsx` – User preferences (theme, language) persisted to AsyncStorage

### Layer 4: Services (`services/`)
- **External API & Authentication Integration**
- **Key files:**
  - `firebase.ts` – Firebase config, auth, Firestore, Storage setup + `uploadImageAndGetUrl()` utility
  - `AuthContext.tsx` – Firebase Auth state management (login/signup/logout + user profile sync via Firestore listener)
  - `Providers.tsx` – Global context wrapper (`<AppProviders>` wraps all navigation)
  - `authStorage.ts` – Secure token storage via expo-secure-store
  - `authApi.ts` – Optional backend API calls

---

## Data Flow & Context

### Authentication Flow
1. User signs up/logs in via `AuthContext` → Firebase Auth creates user
2. `AuthContext` listener syncs Firebase user + Firestore `users/{uid}` doc (includes friends list)
3. All pages access `useContext(AuthContext)` to check `user` and `loading` state
4. Protected routes check `!loading && !user` → redirect to `/auth/login`

### Real-time Data Listeners
- **Pages use Firestore `onSnapshot()`** to subscribe to live data (e.g., groups, notifications)
- **Cleanup:** Always return unsubscribe functions from `useEffect()` to prevent memory leaks
- **Pattern:** See `app/(tabs)/index.tsx` for dual-listener example (groups + unread notifications)

### Theme & Localization
- **Theme:** Controlled by `useSettings()` hook; resolved via system preference (if "system" mode)
- **Language:** Changed via `setLanguage()` → persisted to AsyncStorage + triggers `useEffect()` in layout via `language` dependency
- **Translations:** Use `t("key")` function from `core/i18n/index.ts`; all strings must be defined in `translations` object

---

## Critical Workflows

### Build & Run
```bash
npm install          # Install dependencies
npx expo start       # Start dev server
# Press 'i' for iOS simulator, 'a' for Android, 'w' for web
```

### Branch Naming & PR Workflow
**Required format:**
- `feature/<name>-<short-description>` – New features
- `fix/<name>-<short-description>` – Bug fixes
- `refactor/<name>-<short-description>` – Code cleanup

**Example:** `feature/alice-expense-splitting`, `fix/bob-auth-bug`

**Workflow:**
1. Create branch locally → push to GitHub
2. Open PR into `main` → owner reviews
3. If approved, owner merges; do **NOT** commit directly to `main`

### Linting
```bash
npm run lint         # Run ESLint (Expo config)
```

---

## Key Patterns & Conventions

### 1. Context Providers (Global State)
```tsx
// app/_layout.tsx wraps providers in order:
// SettingsProvider (theme/language) → Inner (ThemeProvider) → AppProviders (AuthProvider)
// Pages use: useSettings(), useContext(AuthContext)
```

### 2. Real-time Firebase Listeners
```tsx
// In pages, use onSnapshot() with cleanup:
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    setData(snapshot.docs.map(doc => doc.data()));
  });
  return () => unsubscribe();
}, []);
```

### 3. Theme & Color System
```tsx
// Don't hardcode colors; use useThemeColor() hook:
const bgColor = useThemeColor({}, "background");
const textColor = useThemeColor({}, "text");
// Defined in constants/theme.ts with light/dark variants
```

### 4. Internationalization
```tsx
// Always use i18n function:
import { t } from "@/core/i18n";
<Text>{t("groups")}</Text>  // Not "Groups" hardcoded
```

### 5. Image Upload Utility
```tsx
// Use provided Firebase helper for image uploads:
import { uploadImageAndGetUrl } from "@/services/firebase";
const url = await uploadImageAndGetUrl(imageUri, userId);
// Handles: URI → Blob → Firebase Storage → Download URL
```

### 6. Type-Safe Navigation
```tsx
// Use expo-router's router object:
import { router } from "expo-router";
router.push({ pathname: "/group/[groupId]", params: { groupId: "123" } });
```

---

## File Structure & Key Files

| Path | Purpose |
|------|---------|
| `app/` | Page screens (Expo Router file-based routing) |
| `app/(tabs)/` | Bottom tab navigation (groups, quick-add, settings) |
| `app/auth/` | Login/signup pages |
| `components/` | Reusable UI components organized by feature |
| `core/i18n/` | i18n setup + translations (English, Chinese, Italian) |
| `core/settings/SettingsContext.tsx` | Theme + language preferences |
| `core/usecases/` | Pure business logic functions (to be filled) |
| `services/firebase.ts` | Firebase initialization + auth/storage utilities |
| `services/AuthContext.tsx` | Auth state + user profile sync |
| `constants/theme.ts` | Light/dark theme color definitions |
| `hooks/use-theme-color.ts` | Hook to read current theme colors |

---

## Common Tasks

### Add a New Page
1. Create `app/path/[param].tsx` (Expo Router auto-routes)
2. Import `AppScreen` wrapper + themed components
3. In `useEffect()`, subscribe to Firestore data via `onSnapshot()`
4. Render using themed components (`ThemedText`, `ThemedView`)

### Add a New Translation
1. Add key-value to `translations.en`, `translations.zh`, `translations.it` in `core/i18n/index.ts`
2. Use `t("newKey")` in pages/components
3. Language switch persists automatically via `setLanguage()`

### Add Firebase Data Sync
1. Define Firestore collection path + query (see `app/(tabs)/index.tsx` for example)
2. Use `onSnapshot()` with cleanup function
3. Update state when snapshot changes
4. Call business logic from `core/usecases/` if needed (e.g., calculate balances)

### Debug
- Use `core/logging/logger.ts` for structured logs
- Check Firebase Console for Firestore/Auth issues
- Verify Firestore security rules allow current user's read/write

---

## Important Constraints & Gotchas

- ⚠️ **Never commit to `main`** – Always use feature branches + PR workflow
- ⚠️ **Clean up Firestore listeners** – Missing cleanup causes memory leaks and duplicate listeners
- ⚠️ **Don't hardcode colors/strings** – Use theme colors and `t()` for i18n
- ⚠️ **Core functions must be pure** – No side effects, no network calls in `core/usecases/`
- ⚠️ **Firebase credentials in `firebase.ts`** – Secrets are exposed (fine for this project; production needs env vars)
- ⚠️ **AsyncStorage/SecureStore are async** – Always await when reading/writing settings or tokens

---

## References

- **Expo Documentation:** https://docs.expo.dev/
- **Firebase SDK (Web):** https://firebase.google.com/docs/web/setup
- **React Router (Expo Router):** https://docs.expo.dev/router/introduction/
- **i18next:** https://www.i18next.com/
