# PKN Portal App - AI Agent Context and Build Rules

## Project overview

This mobile app is the React Native companion for the existing Laravel 12 + Filament 5 portal.

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
  - cached app state in `react-native-mmkv` (preferred over AsyncStorage for 30x faster performance)
- Styling: React Native `StyleSheet`

## Environment constraints

The current development setup is Linux-first and should stay Expo-friendly.

Rules:
1. Do not require native Android or iOS project edits unless explicitly approved.
2. Prefer packages that work with standard Expo workflows.
3. Do not use `react-navigation` directly; use Expo Router patterns.

## Authentication rule (Native Focus)

Use a **Native Login Strategy**.

### Login Flow:
1. Native app provides a typical Login form.
2. User authenticates via API Call.
3. Native app extracts the `token` from the JSON response.

This ensures:
- The app has a **Sanctum Bearer Token** for native API calls.

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
│   ├── components/
│   ├── services/
│   ├── store/
│   │   └── dashboardStore.ts (uses MMKV for 1ms cache loads)
│   └── types/

## Performance & Scalability Tips

1. **FlashList (instead of FlatList)**:
   - Use Shopify's `<FlashList>` for rendering lists, specifically for the **Events Discovery** tab.
   - It is significantly faster and prevents memory crashes when handling large datasets.

2. **React Native MMKV (instead of AsyncStorage)**:
   - Use `react-native-mmkv` for local storage; it is ~30x faster than standard `AsyncStorage`.
   - It plugs directly into Zustand via a custom storage object.
   - *Note*: MMKV requires a custom dev client (it does not work in standard Expo Go).
```

## Coding directives

When generating code for this app:

1. **Auth**: Use the native login form. Do not build WebViews for this.
2. **Types**: Use TypeScript interfaces for all API contracts.
3. **BFF**: Use `GET /api/v1/mobile-dashboard` for the home screen to minimize round-trips.
4. **URLs**: Ensure all image and file paths are absolute URLs returned by the API.
5. **Flows**: Treat all flows as standard React Native stacks interacting with decoupled APIs.

## Testing & Automation

1. **E2E UI Testing (Mobile)**: Use **Maestro** tests (e.g., `.maestro/login_screenshot_flow.yaml`) to validate native application sequences and automatically capture visual workflows.
2. **E2E UI Testing (Web)**: Use **Playwright** scripts (e.g., `take_web_screenshots.js`) for the web fallback testing.
3. **Screenshots**: Always direct flow-extracted screenshots to the central `screenshots/` directory for unified documentation reference.
