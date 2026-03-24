# PKN Portal App - AI Agent Context and Build Rules

## Project overview

This mobile app is the React Native companion for the existing Laravel 12 + Filament 5 portal.

> **Backend Database:** The backend uses **PostgreSQL exclusively** (via Laravel Sail's `pgsql` service). Never suggest SQLite for backend tasks. Tests also run against a dedicated PostgreSQL `testing` database.

The backend already has strong web-side domain logic for:

- phone-number login
- organization-aware membership
- event registration with package breakdowns
- invoices and payment proof flows
- notifications

The mobile app should not try to rebuild all of that on day one.

For a detailed breakdown of the app's user experience and screen transitions, see [UX Flow Guide.md](./UX%20Flow%20Guide.md).

## Recommended product architecture

Use a **Public-First Native** model:

- **Public Screens (Native - No Login Required):**
  - Home Dashboard (Public view)
  - Event Discovery (List and Detail)
  - News/Articles (List and Detail)
- **Authenticated Screens (Native):**
  - My Registrations (History and Management)
  - Event Registration (Native flow: Participant selection, Package selection)
  - Invoices (List and Detail)
  - Profile & Membership
  - Notifications
- **Additional Native Screens:**
  - Login (Native)
  - Organization Management (Native API)
  - Profile/Org Editing (Native API)
  
The key distinction is:
- **Core Experience** (dashboard, news, events, registrations) is **NATIVE**.
- **Setup/Auth** (login, org management) is also **NATIVE**.

## Build stack

- Framework: Expo + React Native
- Language: TypeScript
- Routing: Expo Router
- Networking: Axios
- State: Zustand with persist
- Storage:
  - auth token in `expo-secure-store`
  - cached app state in `react-native-mmkv` (**Standard**: synchronous, 30x faster than AsyncStorage).
- Styling: React Native `StyleSheet` with platform-aware theme tokens (`@/theme/colors`).

## Environment constraints

The current development setup is Linux-first and should stay Expo-friendly.

Rules:
1. Do not require native Android or iOS project edits unless explicitly approved.
2. Prefer packages that work with standard Expo workflows.
3. Do not use `react-navigation` directly; use Expo Router patterns.

## Authentication rule (Sanctum Implementation)

Use a **Native Login Strategy** powered by Laravel Sanctum.

### Login Flow:
1. Native app provides a typical Login form (phone number + password).
2. User authenticates via API Call to `POST /api/v1/auth/login`.
3. Native app extracts the `plainTextToken` from the JSON response.
4. The token is stored in `expo-secure-store` and sent as a `Bearer` token in the `Authorization` header.

This ensures:
- The app has a **Sanctum Bearer Token** for native API calls.
- Old non-functional tokens are revoked on the server upon new login.

## APIs Only rule

There is no WebView bridge. When navigating from a native screen to a mutation flow (e.g., event registration):

1. Call the required API endpoint directly using the Sanctum Bearer token.
2. Update local state.

## Data loading rule

Use **stale-while-revalidate** behavior for native screens.
1. Render cached state immediately.
2. Fetch fresh data in the background.
3. Update UI and cache on success.

## Suggested app structure

```text
pkn-portal-app/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx (Dashboard)
│   │   ├── events.tsx
│   │   ├── invoices.tsx
│   │   └── profile.tsx
│   ├── auth/
│   │   └── login.tsx
│   ├── events/
│   │   └── [id].tsx
│   ├── news/
│   │   └── [id].tsx
│   ├── invoices/
│   │   └── [id].tsx
│   └── webview/
│   │   └── bridge.tsx (For optional magic-link fallbacks)
├── src/
│   ├── theme/
│   │   └── colors.ts (Centralized Light/Dark theme tokens)
│   ├── components/
│   ├── services/
│   │   ├── eventService.ts
│   │   ├── registrationService.ts
│   │   └── paymentService.ts
│   ├── store/
│   │   ├── appStore.ts (uses MMKV via zustandStorage)
│   │   └── zustandStorage.ts (Unified adapter)
│   └── types/

## Architectural Standards

1. **FlashList (instead of FlatList)**:
   - **MANDATORY**: Use Shopify's `<FlashList>` for all lists (`Events`, `News`, `Registrations`, `Documents`, `Invoices`).
   - Use `estimatedItemSize` to prevent blanking.

2. **React Native MMKV**:
   - **MANDATORY**: Use `react-native-mmkv` for all local storage.
   - Plug into Zustand via `src/store/zustandStorage.ts`.

3. **Service Layer Pattern**:
   - UI components must NOT call `api.get/post` directly. 
   - Always use a service from `src/services/` (e.g., `eventService.getEvents()`).

4. **Midtrans Payment Integration**:
   - Use `react-native-webview` for Midtrans Snap.
   - **Strategy**: Fetch `redirect_url` via `paymentService.charge(id)`, then render in a dedicated WebView screen.
   - **Deep Links**: WebView must handle `gojek://`, `shopeepay://`, etc., via `Linking.openURL`.

5. **SDK 55 & React 19 Activity**:
   - Wrap the main tab layout in `<Activity mode="hidden">`.
   - This keeps background screens preserved but inactive, significantly reducing memory pressure and re-render spikes.

## Coding directives

When generating code for this app:

1. **Auth**: Use the native login form. Do not build WebViews for this.
2. **Theming**: Use the `useAppTheme` hook to access colors. Never import `light` or `dark` directly into components.
3. **Types**: Use TypeScript interfaces for all API contracts.
4. **BFF**: Use `GET /api/v1/mobile-dashboard` for the home screen to minimize round-trips.
5. **URLs**: Ensure all image and file paths are absolute URLs returned by the API.
6. **Flows**: Treat all flows as standard React Native stacks interacting with decoupled APIs.

## Testing & Automation

1. **E2E UI Testing (Mobile)**: Use **Maestro** tests (e.g., `.maestro/login_screenshot_flow.yaml`) to validate native application sequences and automatically capture visual workflows.
2. **E2E UI Testing (Web)**: Use **Playwright** scripts (e.g., `take_web_screenshots.js`) for the web fallback testing.
3. **Screenshots**: Always direct flow-extracted screenshots to the central `screenshots/` directory for unified documentation reference.
